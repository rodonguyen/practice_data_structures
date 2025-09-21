import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from "react-native";

export default function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCountries = async (currentOffset = 0) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`https://example.com/countries?offset=${currentOffset}&limit=20`);
      const data = await response.json();
      
      if (currentOffset === 0) {
        // Initial load
        setCountries(data.results);
      } else {
        // Append new data
        setCountries(prev => [...prev, ...data.results]);
      }
      
      setOffset(currentOffset + 20);
      
      // Check if we have all data
      const newTotal = currentOffset === 0 ? data.results.length : countries.length + data.results.length;
      if (newTotal >= data.count) {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries(0);
  }, []);

  const handleEndReached = () => {
    if (hasMore && !loading) {
      fetchCountries(offset);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item.name}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={countries}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

///////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    width: "100%",
    height: "100%",
  },
  listItem: {
    width: "100%",
    height: "40px",
    padding: "8px",
    alignItems: "flexStart",
  },
});
