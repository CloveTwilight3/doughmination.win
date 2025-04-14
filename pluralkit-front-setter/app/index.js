import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from "react-native";
import axios from "axios";

const API_BASE = "/api"; // Replace with your backend URL

export default function App() {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/members`)
      .then(res => setMembers(res.data.members))
      .catch(err => console.error("Error fetching members", err));
  }, []);

  const setFront = async () => {
    try {
      await axios.post(`${API_BASE}/switch`, {
        members: selectedId ? [selectedId] : []
      });
      Alert.alert("Success", "Front updated successfully!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update front.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Fronter</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.memberItem,
              item.id === selectedId && styles.selected
            ]}
            onPress={() => setSelectedId(item.id)}
          >
            <Text style={styles.memberText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Set Front" onPress={setFront} disabled={!selectedId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: "#fff"
  },
  title: {
    fontSize: 24, fontWeight: "bold", marginBottom: 20
  },
  memberItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: "#cce5ff",
    borderColor: "#66b3ff",
  },
  memberText: {
    fontSize: 18
  }
});
