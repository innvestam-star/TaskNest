import { useState } from 'react';
import { User, Mail, Bell, Shield, CreditCard, Check, Crown, Sparkles, Zap } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [currentPlan, setCurrentPlan] = useState('free');
    const [profile, setProfile] = useState({
        name: 'TaskNest User',
        email: 'user@example.com',
        notifications: {
            email: true,
            push: true,
            reminders: true
        }
    });

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '$0',
            period: '/month',
            icon: Zap,
            color: 'var(--text-secondary)',
            features: [
                'Up to 20 tasks',
                'Basic calendar view',
                'Email reminders',
                '1 recurring task'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$9',
            period: '/month',
            icon: Crown,
            color: 'var(--primary)',
            popular: true,
            features: [
                'Unlimited tasks',
                'All calendar views',
                'Push notifications',
                'Unlimited recurring tasks',
                'AI Task Assistant',
                'Priority support'
            ]
        },
        {
            id: 'business',
            name: 'Business',
            price: '$29',
            period: '/month',
            icon: Sparkles,
            color: 'var(--status-cyan)',
            features: [
                'Everything in Pro',
                'Client booking page',
                'Team collaboration',
                'Advanced analytics',
                'Custom branding',
                'API access',
                'Dedicated support'
            ]
        }
    ];

    const handlePlanSelect = (planId) => {
        if (planId !== currentPlan) {
            // In production, this would redirect to payment
            setCurrentPlan(planId);
        }
    };

    const handleProfileSave = () => {
        // In production, this would save to Firebase
        alert('Profile saved successfully!');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Settings</h1>
                <p>Manage your account and preferences.</p>
            </header>

            <div className={styles.tabs}>
                {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'subscription', label: 'Subscription', icon: CreditCard },
                    { id: 'security', label: 'Security', icon: Shield }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeTab === 'profile' && (
                    <div className={styles.section}>
                        <h2>Profile Information</h2>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                        <button className={styles.saveBtn} onClick={handleProfileSave}>
                            Save Changes
                        </button>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className={styles.section}>
                        <h2>Notification Preferences</h2>
                        {[
                            { key: 'email', label: 'Email Notifications', desc: 'Receive task reminders via email' },
                            { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for due tasks' },
                            { key: 'reminders', label: 'Daily Reminders', desc: 'Get a daily summary of your tasks' }
                        ].map(item => (
                            <div key={item.key} className={styles.toggleItem}>
                                <div>
                                    <h4>{item.label}</h4>
                                    <p>{item.desc}</p>
                                </div>
                                <button
                                    className={`${styles.toggle} ${profile.notifications[item.key] ? styles.on : ''}`}
                                    onClick={() => setProfile({
                                        ...profile,
                                        notifications: {
                                            ...profile.notifications,
                                            [item.key]: !profile.notifications[item.key]
                                        }
                                    })}
                                >
                                    <span className={styles.toggleThumb}></span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className={styles.section}>
                        <h2>Choose Your Plan</h2>
                        <p className={styles.planSubtitle}>Select the plan that best fits your needs.</p>
                        <div className={styles.plans}>
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    className={`${styles.planCard} ${currentPlan === plan.id ? styles.current : ''} ${plan.popular ? styles.popular : ''}`}
                                >
                                    {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
                                    <div className={styles.planIcon} style={{ color: plan.color }}>
                                        <plan.icon size={28} />
                                    </div>
                                    <h3>{plan.name}</h3>
                                    <div className={styles.planPrice}>
                                        <span className={styles.price}>{plan.price}</span>
                                        <span className={styles.period}>{plan.period}</span>
                                    </div>
                                    <ul className={styles.features}>
                                        {plan.features.map((feature, i) => (
                                            <li key={i}><Check size={14} /> {feature}</li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`${styles.planBtn} ${currentPlan === plan.id ? styles.currentBtn : ''}`}
                                        onClick={() => handlePlanSelect(plan.id)}
                                        style={{ backgroundColor: currentPlan === plan.id ? 'transparent' : plan.color }}
                                    >
                                        {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className={styles.section}>
                        <h2>Security Settings</h2>
                        <div className={styles.securityItem}>
                            <div>
                                <h4>Change Password</h4>
                                <p>Update your password regularly for security.</p>
                            </div>
                            <button className={styles.actionBtn}>Change</button>
                        </div>
                        <div className={styles.securityItem}>
                            <div>
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account.</p>
                            </div>
                            <button className={styles.actionBtn}>Enable</button>
                        </div>
                        <div className={styles.securityItem}>
                            <div>
                                <h4>Delete Account</h4>
                                <p>Permanently delete your account and all data.</p>
                            </div>
                            <button className={styles.dangerBtn}>Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
