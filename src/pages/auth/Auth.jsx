import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Chrome, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, signup, loginWithGoogle } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    throw new Error('Please enter your name');
                }
                await signup(name, email, password);
            }
            navigate('/');
        } catch (err) {
            console.error('Auth error:', err);
            // Handle Firebase error messages
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('This email is already registered');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/weak-password':
                    setError('Password should be at least 6 characters');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Invalid email or password');
                    break;
                default:
                    setError(err.message || 'An error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            console.error('Google login error:', err);
            setError('Google sign-in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-brand-error/10 border border-brand-error/20 flex items-center gap-2 text-brand-error text-sm"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

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
                                            <Input
                                                className="pl-10"
                                                placeholder="John Doe"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-brand-text-secondary">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-brand-text-muted" />
                                        <Input
                                            className="pl-10"
                                            placeholder="name@example.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
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
                                        <Input
                                            className="pl-10"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
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

                        <Button
                            variant="secondary"
                            className="w-full"
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
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

