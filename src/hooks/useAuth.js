import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(null);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function verifyAdmin(userSession) {
      if (!userSession?.user) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setShopId(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, shop_id')
          .eq('user_id', userSession.user.id)
          .maybeSingle();

        if (error || !data) {
          throw new Error('Not an admin');
        }

        if (mounted) {
          setIsAdmin(true);
          setAdminRole(data.role);
          setShopId(data.shop_id);
        }
      } catch (err) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setShopId(null);
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

  return { session, loading, user: session?.user ?? null, isAdmin, adminRole, shopId };
}
