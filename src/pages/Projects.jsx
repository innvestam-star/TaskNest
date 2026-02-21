import { Plus, Search, MoreHorizontal, Folder, Clock, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import CreateProjectModal from '../components/CreateProjectModal';
import { getProjects, createProject } from '../services/projectService';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            await createProject(projectData);
            loadProjects();
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const filteredProjects = projects.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-background transition-colors duration-500">
            <PageHeader
                title="Projects"
                subtitle={`${projects.length} Active Projects`}
            >
                <div className="flex gap-3">
                    <div className="hidden md:flex items-center bg-surface/50 border border-border/50 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="bg-transparent border-none outline-none text-sm ml-3 w-full text-text-main placeholder-slate-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 glow-blue"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>
            </PageHeader>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-20 bg-surface/30 backdrop-blur-xl border border-dashed border-border/40 rounded-[2.5rem]">
                            <Folder className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-20" />
                            <h3 className="text-2xl font-black text-text-main tracking-tight mb-2">No projects found</h3>
                            <p className="text-slate-400 text-lg font-medium opacity-80 px-4">Create your first project to start organizing your work with NestAI.</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-8 inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 glow-blue"
                            >
                                <Plus className="w-5 h-5" />
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map(project => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="group bg-surface/30 backdrop-blur-xl border border-border/40 rounded-[2rem] p-8 hover:border-primary/50 transition-all shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 block electric-card relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="p-4 bg-primary/10 text-primary rounded-[1.25rem] group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: `${project.color}20`, color: project.color }}
                                        >
                                            <Folder className="w-7 h-7" />
                                        </div>
                                        <button className="p-2.5 text-slate-500 hover:bg-surface hover:text-primary rounded-2xl transition-all border border-transparent hover:border-border cursor-pointer">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-black text-text-main group-hover:text-primary transition-colors mb-2 tracking-tight">
                                        {project.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium opacity-80 line-clamp-2 mb-8 leading-relaxed">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-col gap-6">
                                        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${project.progress || 0}%`, backgroundColor: project.color }}
                                            ></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-text-main transition-colors">
                                                    <CheckCircle className="w-4 h-4 text-primary/70" />
                                                    <span className="text-xs font-black uppercase tracking-widest">{project.tasksCount || 0} tasks</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-black uppercase tracking-widest">
                                                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-2xl border-2 border-surface bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-xl">
                                                        U{i}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateProject}
                projectCount={projects.length}
            />
        </div>
    );
}
