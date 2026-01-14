import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Chrome, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const toggleMode = () => setIsLogin(!isLogin);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 2000);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent mb-2">
                        TaskNest
                    </h1>
                    <p className="text-brand-text-secondary">
                        Organize locally, thrive globally.
                    </p>
                </div>

                <Card className="border-brand-primary/20 shadow-glow">
                    <CardHeader>
                        <CardTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
                        <CardDescription>
                            {isLogin
                                ? 'Enter your credentials to access your workspace'
                                : 'Get started with your free lifetime account'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-brand-text-secondary">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-brand-text-muted" />
                                            <Input className="pl-10" placeholder="John Doe" type="text" required />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-brand-text-muted" />
                                        <Input className="pl-10" placeholder="name@example.com" type="email" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-brand-text-secondary">Password</label>
                                        {isLogin && (
                                            <a href="#" className="text-xs text-brand-primary hover:text-brand-primaryHover">
                                                Forgot password?
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-brand-text-muted" />
                                        <Input className="pl-10" placeholder="••••••••" type="password" required />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                                        <CheckCircle2 className="h-3 w-3 text-brand-success" />
                                        <span>I agree to the Terms of Service and Privacy Policy</span>
                                    </div>
                                )}

                                <Button className="w-full" size="lg" isLoading={isLoading}>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </Button>
                            </motion.form>
                        </AnimatePresence>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-brand-surface px-2 text-brand-text-muted">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="secondary" className="w-full" type="button">
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-brand-text-secondary">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={toggleMode}
                                className="text-brand-primary font-semibold hover:underline focus:outline-none"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
