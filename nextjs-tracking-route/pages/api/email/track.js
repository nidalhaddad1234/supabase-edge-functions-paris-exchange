import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Base64 encoded 1x1 transparent PNG for tracking pixels
const TRANSPARENT_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default async function handler(req, res) {
  // Extract tracking parameters from query
  const { id, e: event, rating, redirect } = req.query;
  
  if (!id || !event) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  try {
    // Record the tracking event
    if (event === 'open') {
      // For opens, first get the current count to increment it
      const { data } = await supabase
        .from('email_tracking')
        .select('opens')
        .eq('tracking_id', id)
        .single();
      
      const currentOpens = data?.opens || 0;
      
      // Update the tracking record
      await supabase
        .from('email_tracking')
        .update({
          opens: currentOpens + 1,
          last_open_at: new Date().toISOString()
        })
        .eq('tracking_id', id);
      
      // Return a transparent tracking pixel
      const buffer = Buffer.from(TRANSPARENT_PIXEL, 'base64');
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.status(200).send(buffer);
    }
    
    if (event === 'click') {
      // For clicks, first get the current count to increment it
      const { data } = await supabase
        .from('email_tracking')
        .select('clicks')
        .eq('tracking_id', id)
        .single();
      
      const currentClicks = data?.clicks || 0;
      
      // Prepare update data
      const updateData = {
        clicks: currentClicks + 1,
        last_click_at: new Date().toISOString()
      };
      
      // If a rating was provided, update it (ratings 1-5)
      if (rating && /^[1-5]$/.test(rating)) {
        updateData.rating = parseInt(rating, 10);
      }
      
      // Update the tracking record
      await supabase
        .from('email_tracking')
        .update(updateData)
        .eq('tracking_id', id);
      
      // Redirect to the specified URL if provided
      if (redirect) {
        return res.redirect(302, redirect);
      }
      
      // If no redirect, just return success
      return res.status(200).json({ success: true });
    }
    
    // For unknown event types
    return res.status(400).json({ error: 'Invalid event type' });
  } catch (error) {
    console.error('Email tracking error:', error);
    
    // Don't expose error details to client if it's a redirect
    if (event === 'click'