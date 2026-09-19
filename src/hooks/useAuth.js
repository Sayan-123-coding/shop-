import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function verifyAdmin(userSession) {
      if (!userSession?.user) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', userSession.user.id)
          .single();

        if (error || !data) {
          throw new Error('Not an admin');
        }

        if (mounted) {
          setIsAdmin(true);
          setAdminRole(data.role);
        }
      } catch (err) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          // If they aren't an admin but have a session, we should probably sign them out
          // to prevent ghost sessions, but for now we just mark them as non-admin.
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession);
        verifyAdmin(initialSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        verifyAdmin(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, user: session?.user ?? null, isAdmin, adminRole };
}
