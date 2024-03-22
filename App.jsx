import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [tags, setTags] = useState('');
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async updatedNotes => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const showMessage = msg => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
  };

  const addNote = () => {
    if (inputText) {
      const newNote = {
        text: inputText,
        tags: tags.split(','),
        completed: false,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setInputText('');
      setTags('');
      showMessage('Tarefa adicionada!');
    }
  };

  const completeNote = index => {
    const updatedNotes = [...notes];
    updatedNotes[index].completed = true;
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    showMessage('Tarefa concluída!');
  };

  const uncompleteNote = index => {
    const updatedNotes = [...notes];
    updatedNotes[index].completed = false;
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    showMessage('Tarefa desconcluída!');
  };

  const deleteNote = index => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    showMessage('Tarefa deletada!');
  };

  const editNote = index => {
    const noteToEdit = notes[index];
    setInputText(noteToEdit.text);
    setTags(noteToEdit.tags.join(', '));
    setEditIndex(index);
  };

  const updateNote = () => {
    if (editIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[editIndex].text = inputText;
      updatedNotes[editIndex].tags = tags.split(',');
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setInputText('');
      setTags('');
      setEditIndex(null);
      showMessage('Tarefa editada!');
    }
  };

  const renderNote = ({item, index}) => (
    <View
      style={[
        styles.noteContainer,
        {backgroundColor: item.completed ? '#dcdcdc' : '#f0f0f0'},
      ]}>
      <Text
        style={{
          marginBottom: 5,
          textDecorationLine: item.completed ? 'line-through' : 'none',
        }}>
        {item.text}
      </Text>
      <Text style={styles.tags}>{item.tags.join(', ')}</Text>
      <View style={{flexDirection: 'row', marginTop: 5}}>
        <TouchableOpacity
          onPress={() => completeNote(index)}
          style={[styles.button, {backgroundColor: 'green'}]}>
          <Text style={{color: '#fff'}}>Concluir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => uncompleteNote(index)}
          style={[styles.button, {backgroundColor: 'yellow'}]}>
          <Text style={{color: '#000'}}>Desconcluir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => editNote(index)}
          style={[styles.button, {backgroundColor: 'blue'}]}>
          <Text style={{color: '#fff'}}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteNote(index)}
          style={[styles.button, {backgroundColor: 'red'}]}>
          <Text style={{color: '#fff'}}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const searchFilter = note => {
    const textMatch = note.text
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return textMatch;
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 24, marginBottom: 20}}>Bloco de Notas</Text>

      {/* Formulário para adicionar novas notas */}
      <TextInput
        placeholder="Digite sua nota..."
        value={inputText}
        onChangeText={text => setInputText(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Adicione tags separadas por vírgula"
        value={tags}
        onChangeText={text => setTags(text)}
        style={styles.input}
      />
      <Button
        title="Adicionar Nota"
        onPress={editIndex !== null ? updateNote : addNote}
      />

      {/* Input para pesquisa */}
      <TextInput
        placeholder="Pesquisar notas..."
        value={searchText}
        onChangeText={text => setSearchText(text)}
        style={[styles.input, {marginTop: 20}]}
      />

      {/* Mensagem de feedback */}
      {message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      {/* Lista de notas */}
      {notes.filter(searchFilter).length > 0 ? (
        <FlatList
          data={notes.filter(searchFilter)}
          renderItem={renderNote}
          keyExtractor={(item, index) => index.toString()}
          style={{marginTop: 20}}
        />
      ) : (
        <Text style={{marginTop: 20}}>Nota não encontrada :(</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  noteContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  tags: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 5,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 5,
  },
  messageContainer: {
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  messageText: {
    color: '#ff0000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
