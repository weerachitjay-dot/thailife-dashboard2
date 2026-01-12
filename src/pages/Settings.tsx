import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, CheckCircle, AlertTriangle, Facebook } from 'lucide-react';

export default function Settings() {
    const [token, setToken] = useState('');
    const [status, setStatus] = useState<'loading' | 'saved' | 'error' | 'idle'>('loading');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        checkTokenStatus();
    }, []);

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
                setMsg('Active token found');
            } else {
                setStatus('idle');
                setMsg('No token configured');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMsg('Error fetching token');
        }
    };

    const handleSave = async () => {
        if (!token) return;
        setStatus('loading');
        try {
            const { error } = await supabase
                .from('config_tokens')
                .upsert({
                    provider: 'facebook',
                    token_type: 'long_lived',
                    access_token: token
                }, { onConflict: 'provider, token_type' });

            if (error) throw error;
            setStatus('saved');
            setMsg('Token saved successfully!');
        } catch (err: any) {
            setStatus('error');
            setMsg(err.message);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Facebook className="text-blue-600" /> Facebook Sync Settings
            </h1>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Facebook Access Token (Long-lived)</label>
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full p-2 border rounded bg-background"
                        placeholder="EAAB..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Paste your long-lived Graph API token here. This allows the backend engine to fetch Ads data.
                    </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2">
                        {status === 'saved' && <CheckCircle className="text-green-500 h-5 w-5" />}
                        {status === 'error' && <AlertTriangle className="text-red-500 h-5 w-5" />}
                        <span className={`text-sm ${status === 'saved' ? 'text-green-600' : status === 'error' ? 'text-red-600' : ''}`}>
                            {msg}
                        </span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={status === 'loading'}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                        <Save size={16} />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}
