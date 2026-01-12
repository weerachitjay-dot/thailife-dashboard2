import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, AlertTriangle, Facebook, ShieldCheck } from 'lucide-react';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

export default function Admin() {
    const [token, setToken] = useState('');
    const [appId, setAppId] = useState('');
    const [status, setStatus] = useState<'loading' | 'saved' | 'error' | 'idle'>('loading');
    const [msg, setMsg] = useState('');
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);

    useEffect(() => {
        checkTokenStatus();
        loadFacebookSdk();
    }, []);

    const loadFacebookSdk = () => {
        if (window.FB) {
            setIsSdkLoaded(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: appId, // Will be updated when user inputs it or if we reload
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
            setIsSdkLoaded(true);
        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s) as HTMLScriptElement; js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    const checkTokenStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('config_tokens')
                .select('*')
                .eq('provider', 'facebook')
                .eq('token_type', 'long_lived')
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setToken(data.access_token);
                setStatus('saved');
                setMsg('System is connected to Facebook');
            } else {
                setStatus('idle');
                setMsg('No active connection');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMsg('Error checking status');
        }
    };

    const handleFacebookLogin = () => {
        if (!appId) {
            alert("Please enter your Facebook App ID first.");
            return;
        }

        // Re-init with current App ID just in case
        window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
        });

        window.FB.login((response: any) => {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                const accessToken = response.authResponse.accessToken;
                saveToken(accessToken);
            } else {
                console.log('User cancelled login or did not fully authorize.');
                setMsg('Login cancelled');
                setStatus('error');
            }
        }, { scope: 'ads_read,leads_retrieval,business_management' });
    };

    const saveToken = async (newToken: string) => {
        setStatus('loading');
        try {
            const { error } = await supabase
                .from('config_tokens')
                .upsert({
                    provider: 'facebook',
                    token_type: 'long_lived',
                    access_token: newToken
                }, { onConflict: 'provider, token_type' });

            if (error) throw error;
            setToken(newToken);
            setStatus('saved');
            setMsg('Facebook connected & Token saved!');
        } catch (err: any) {
            setStatus('error');
            setMsg(err.message);
        }
    };

    const handleManualSave = () => {
        if (!token) return;
        saveToken(token);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 rounded-full">
                    <ShieldCheck className="text-blue-600 h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Admin Connection</h1>
                    <p className="text-muted-foreground">Manage data sources and authentication</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Status Card */}
                <div className={`border rounded-lg p-6 flex items-center justify-between ${status === 'saved' ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
                    <div className="flex items-center gap-3">
                        {status === 'saved' ? <CheckCircle className="text-green-600 h-6 w-6" /> : <AlertTriangle className="text-amber-500 h-6 w-6" />}
                        <div>
                            <h3 className="font-semibold text-lg">{status === 'saved' ? 'System Online' : 'Action Required'}</h3>
                            <p className="text-sm opacity-80">{msg}</p>
                        </div>
                    </div>
                    {status === 'saved' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>}
                </div>

                {/* FB Login Card */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Facebook className="text-blue-600" /> Facebook Authentication
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Facebook App ID</label>
                            <input
                                type="text"
                                value={appId}
                                onChange={(e) => setAppId(e.target.value)}
                                className="w-full p-2 border rounded bg-background"
                                placeholder="Example: 1234567890"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Needed to launch the Facebook Login popup.</p>
                        </div>

                        <button
                            onClick={handleFacebookLogin}
                            className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                        >
                            <Facebook size={20} fill="currentColor" />
                            Log in with Facebook
                        </button>
                    </div>
                </div>

                {/* Manual Fallback */}
                <div className="bg-card border rounded-lg p-6 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Advanced / Manual Input</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="flex-1 p-2 border rounded bg-background text-sm font-mono"
                            placeholder="EAAB..."
                        />
                        <button
                            onClick={handleManualSave}
                            className="px-4 py-2 border rounded hover:bg-muted flex items-center gap-2"
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
