with open('frontend/src/pages/EquipmentList.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_state = '''  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);'''

new_state = '''  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);'''
assert old_state in text, "old_state not found"
text = text.replace(old_state, new_state, 1)

old_fetch = '''    try {
      const data = await api.getEquipment(selectedType, selectedLocation, searchQuery);
      setEquipmentList(data);'''

new_fetch = '''    try {
      const data = await api.getEquipment(selectedType, selectedLocation, searchQuery, maxPrice);
      setEquipmentList(data);'''
assert old_fetch in text, "old_fetch not found"
text = text.replace(old_fetch, new_fetch, 1)

old_effect = '''  useEffect(() => {
    fetchEquipment();
  }, [selectedType, selectedLocation, searchQuery]);'''

new_effect = '''  useEffect(() => {
    fetchEquipment();
  }, [selectedType, selectedLocation, searchQuery, maxPrice]);'''
assert old_effect in text, "old_effect not found"
text = text.replace(old_effect, new_effect, 1)

old_reset = '''  const handleReset = () => {
    setSelectedType('ALL');
    setSelectedLocation('');
    setSearchQuery('');
    setSearchParams({});
  };'''

new_reset = '''  const handleReset = () => {
    setSelectedType('ALL');
    setSelectedLocation('');
    setSearchQuery('');
    setMaxPrice(undefined);
    setSearchParams({});
  };'''
assert old_reset in text, "old_reset not found"
text = text.replace(old_reset, new_reset, 1)

old_render = '''      {/* Filter toolbar */}
      <EquipmentFilters
        selectedType={selectedType}
        onSelectType={handleTypeSelect}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />'''

new_render = '''      {/* Filter toolbar */}
      <EquipmentFilters
        selectedType={selectedType}
        onSelectType={handleTypeSelect}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
      />'''
assert old_render in text, "old_render not found"
text = text.replace(old_render, new_render, 1)

with open('frontend/src/pages/EquipmentList.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/pages/EquipmentList.tsx updated")

