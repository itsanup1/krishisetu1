with open('frontend/src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_submit = '''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        is_equipment_owner: isOwner,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const updated = await api.updateProfile(payload);
      localStorage.setItem('krishi_user', JSON.stringify(updated));
      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };'''

new_submit = '''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }
    const digits = phone.replace(/\\D/g, '');
    if (digits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('District / location cannot be left blank.');
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        is_equipment_owner: isOwner,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const updated = await api.updateProfile(payload);
      localStorage.setItem('krishi_user', JSON.stringify(updated));
      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };'''

assert old_submit in text, "old_submit not found"
text = text.replace(old_submit, new_submit, 1)

with open('frontend/src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/pages/Profile.tsx updated")

