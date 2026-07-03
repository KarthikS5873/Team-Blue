import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, phone, password, name, location } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      name,
      email,
      phone: phone || null,
      location: location || null
    });

    if (userError) {
      console.error('Failed to create user profile:', userError);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    res.status(201).json({
      message: 'Account created. Check email for verification.',
      session: authData.session,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const { data: business } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .maybeSingle();

    res.json({
      session: data.session,
      user: profile,
      businessProfile: business
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .maybeSingle();

    if (profileErr && profileErr.code === 'PGRST205') {
      return res.json({ user: null, businessProfile: null, message: 'Database migration required' });
    }

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.error('Get profile error:', profileErr);
    }

    let business = null;
    try {
      const { data: biz } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', req.userId)
        .maybeSingle();
      business = biz;
    } catch (e) {
      // Table may not exist
    }

    res.json({ user: profile || null, businessProfile: business || null });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/onboarding', authenticateUser, async (req, res) => {
  try {
    const {
      name, location, business_name, business_type, role,
      description, goal, monthly_revenue, weekly_revenue, daily_revenue
    } = req.body;

    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: req.userId,
        email: req.userEmail,
        name,
        location,
        onboarding_completed: true
      });

    if (userError) return res.status(400).json({ error: userError.message });

    const { data: existingBusiness } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', req.userId)
      .maybeSingle();

    let businessError;
    if (existingBusiness) {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          business_name, business_type, role, description, goal,
          monthly_revenue: monthly_revenue || 0,
          weekly_revenue: weekly_revenue || 0,
          daily_revenue: daily_revenue || 0
        })
        .eq('user_id', req.userId);
      businessError = error;
    } else {
      const { error } = await supabase
        .from('business_profiles')
        .insert({
          user_id: req.userId,
          business_name, business_type, role, description, goal,
          monthly_revenue: monthly_revenue || 0,
          weekly_revenue: weekly_revenue || 0,
          daily_revenue: daily_revenue || 0
        });
      businessError = error;
    }

    if (businessError) return res.status(400).json({ error: businessError.message });

    const { data: user } = await supabase.from('users').select('*').eq('id', req.userId).single();
    const { data: business } = await supabase.from('business_profiles').select('*').eq('user_id', req.userId).single();

    res.json({ user, businessProfile: business });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
