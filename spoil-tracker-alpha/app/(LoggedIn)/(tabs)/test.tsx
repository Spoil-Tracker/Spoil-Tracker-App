import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import CustomItemsMenu from '@/components/Food/CustomItems';
import { useAuth } from '@/services/authContext';
import { getAccountByOwnerID, getCustomItemsFromAccount } from '@/components/Account/AccountService';
import { FoodGlobal } from '@/src/entities/FoodGlobal';

export default function Test() {
  const { user } = useAuth(); // Call the hook at the top level
  const [items, setItems] = useState<FoodGlobal[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      if (!user) return;
      const account = await getAccountByOwnerID(user.uid);
      const customItems = await getCustomItemsFromAccount(account.id);
      setItems(customItems);
    };
    loadItems();
  }, [user]);

  return (
    <View>
      <CustomItemsMenu customItems={items} />
    </View>
  );
}
