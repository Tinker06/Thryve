import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { memberLogin } from '../lib/auth';

interface LoginProps {
  onLogin: () => Promise<void> | void;
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'team' | 'member'>('team');
  const [email, setEmail] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'member') {
        await memberLogin(email.trim(), password);
      } else {
        const response = await fetch('/.netlify/functions/team-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamEmail: email.trim(),
            teamCode: teamCode.trim(),
            password,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Login failed');
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }
      }

      await onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main">
      <div className="section-head">
        <div>
          <h2>THRYVE LOGIN</h2>
          <p>Sign in to your team workspace.</p>
        </div>
      </div>

      <div className="form-card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            className={`btn ${mode === 'team' ? 'pink' : 'paper'}`}
            onClick={() => setMode('team')}
            type="button"
          >
            TEAM LEAD
          </button>
          <button
            className={`btn ${mode === 'member' ? 'pink' : 'paper'}`}
            onClick={() => setMode('member')}
            type="button"
          >
            MEMBER
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />

          {mode === 'team' && (
            <>
              <label>Team code</label>
              <input
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="THRYVE-1234"
                required
              />
            </>
          )}

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />

          {error && <div className="notice red">{error}</div>}

          <button
            className="btn teal"
            type="submit"
            disabled={loading}
            style={{ marginTop: 16 }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </main>
  );
}
