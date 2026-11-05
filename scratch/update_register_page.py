with open('frontend/src/pages/Register.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_submit = '''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        is_equipment_owner: role === 'FARMER' ? isEquipmentOwner : false,
        location,
      });

      if (role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/products');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };'''

new_submit = '''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please provide a full name (minimum 2 characters).');
      return;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    const digits = phone.replace(/\\D/g, '');
    if (digits.length < 10) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify your district or farm location.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role,
        is_equipment_owner: role === 'FARMER' ? isEquipmentOwner : false,
        location: location.trim(),
      });

      if (role === 'VENDOR') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/products');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };'''

assert old_submit in text, "old_submit not found"
text = text.replace(old_submit, new_submit, 1)

with open('frontend/src/pages/Register.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/pages/Register.tsx updated")

