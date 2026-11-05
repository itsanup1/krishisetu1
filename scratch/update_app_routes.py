with open('frontend/src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_owner_routes = '''                {/* Equipment Owner Routes (Farmer with is_equipment_owner=true) */}
                <Route
                  path="/owner/equipment"
                  element={
                    <ProtectedRoute>
                      <MyEquipment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-equipment"
                  element={<Navigate to="/owner/equipment" replace />}
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <ProtectedRoute>
                      <EquipmentBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-equipment/bookings"
                  element={<Navigate to="/owner/bookings" replace />}
                />
                <Route
                  path="/equipment/new"
                  element={
                    <ProtectedRoute>
                      <EquipmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/equipment/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EquipmentForm />
                    </ProtectedRoute>
                  }
                />'''

new_owner_routes = '''                {/* Equipment Owner Routes (Farmer with is_equipment_owner=true) */}
                <Route
                  path="/owner/equipment"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <MyEquipment />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/my-equipment"
                  element={<Navigate to="/owner/equipment" replace />}
                />
                <Route
                  path="/owner/bookings"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentBookings />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/my-equipment/bookings"
                  element={<Navigate to="/owner/bookings" replace />}
                />
                <Route
                  path="/equipment/new"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentForm />
                    </RoleBasedRoute>
                  }
                />
                <Route
                  path="/equipment/edit/:id"
                  element={
                    <RoleBasedRoute allowedRoles={['FARMER', 'ADMIN']} requireEquipmentOwner={true}>
                      <EquipmentForm />
                    </RoleBasedRoute>
                  }
                />'''

assert old_owner_routes in text, "old_owner_routes not found"
text = text.replace(old_owner_routes, new_owner_routes, 1)

with open('frontend/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESS: frontend/src/App.tsx updated")

