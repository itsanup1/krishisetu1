with open('frontend/src/context/AuthContext.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_init = '''      if (healthy) {
        let authSuccess = false;
        if (savedToken && !savedToken.startsWith('mock-')) {
          try {
            setToken(savedToken);
            const me = await api.getMe();
            setUser(me);
            localStorage.setItem('krishi_user', JSON.stringify(me));
            authSuccess = true;
          } catch {
            localStorage.removeItem('krishi_token');
            localStorage.removeItem('krishi_user');
          }
        }

        if (!authSuccess) {
          try {
            const res = await api.login('farmer@krishisetu.com', 'farmer123');
            setToken(res.access_token);
            setUser(res.user);
            localStorage.setItem('krishi_token', res.access_token);
            localStorage.setItem('krishi_user', JSON.stringify(res.user));
            authSuccess = true;
          } catch (e) {
            console.warn('Initial backend login failed, falling back to mock user', e);
          }
        }
      } else {'''

new_init = '''      if (healthy) {
        if (savedToken && !savedToken.startsWith('mock-')) {
          try {
            setToken(savedToken);
            const me = await api.getMe();
            setUser(me);
            localStorage.setItem('krishi_user', JSON.stringify(me));
          } catch {
            localStorage.removeItem('krishi_token');
            localStorage.removeItem('krishi_user');
            setUser(null);
            setToken(null);
          }
        } else {
          // If no token, user is unauthenticated
          setUser(null);
          setToken(null);
        }
      } else {'''

assert old_init in text, "old_init not found"
text = text.replace(old_init, new_init, 1)

with open('frontend/src/context/AuthContext.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/context/AuthContext.tsx updated")

