import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json()

  // Split full name into first + last
  const nameParts = (fullName || '').trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Auth client (for signup)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  // Admin client (for inserting into users table, bypasses RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // ✅ Save name to public.users table
  if (data.user) {
    await supabaseAdmin.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      first_name: firstName,
      last_name: lastName,
    })
  }

  if (data.session) {
    const response = NextResponse.json({ ok: true })
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    })
    return response
  }

  return NextResponse.json({ ok: true, confirmEmail: true })
}
