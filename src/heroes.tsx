import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppContext} from './app-context';

const {width} = Dimensions.get('window');

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  while (color.length < 7) color += letters[Math.floor(Math.random() * 16)];
  return color;
};

const getRandomName = () => {
  const letters = '0123456789ABCDEF';
  let name = '';
  while (name.length < 7) name += letters[Math.floor(Math.random() * 16)];
  return name;
};

export const Heroes = () => {
  const {db} = useContext(AppContext);
  const [name, setName] = useState('');
  const [heroes, setHeroes] = useState([]);

  useEffect(() => {
    let sub;
    if (db && db.heroes) {
      sub = db.heroes.find().$.subscribe(async () => {
        const rxdbHeroes = await db.heroes.find().exec();
        setHeroes(rxdbHeroes);
      });
    }
    return () => {
      if (sub && sub.unsubscribe) sub.unsubscribe();
    };
  }, [db]);

  const addHero = async () => {
    const color = getRandomColor();
    await db.collections.heroes.upsert({name, color});
    console.log('addHero: ' + name);
    console.log('color: ' + color);
    setName('');
  };

  const removeHero = async hero => {
    Alert.alert(
      'Delete hero?',
      `Are you sure you want to delete ${hero.get('name')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const doc = db.collections.heroes.findOne({
              selector: {
                name: hero.get('name'),
              },
            });
            await doc.remove();
          },
        },
      ],
    );
  };

  const generalData = async () => {
    if (db && db.heroes) {
      for (let i = 0; i < 10; i++) {
        const name = `${i}`; //getRandomName();
        const color = getRandomColor();
        await db.collections.heroes.upsert({name, color});
      }
    }
  };

  const resetData = async () => {
    if (db && db.heroes) {
      const query = await db.heroes.find();
      await query.remove();
      setHeroes([]);
    }
  };

  return (
    <View style={styles.topContainer}>
      <StatusBar backgroundColor="#55C7F7" barStyle="light-content" />
      <Text style={styles.title}>React native rxdb example</Text>

      <TouchableOpacity style={styles.general} onPress={generalData}>
        <Text style={styles.generalText}>General data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.general} onPress={resetData}>
        <Text style={styles.generalText}>Reset data</Text>
      </TouchableOpacity>

      <ScrollView style={styles.heroesList}>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={name => setName(name)}
            placeholder="Type to add a hero..."
            onSubmitEditing={addHero}
          />
          {name.length > 1 && (
            <TouchableOpacity onPress={addHero}>
              <Image
                style={styles.plusImage}
                source={require('../assets/plusIcon.png')}
              />
            </TouchableOpacity>
          )}
        </View>
        {heroes.length === 0 && (
          <Text style={{marginTop: 10}}>No heroes to display ...</Text>
        )}
        {heroes.map((hero, index) => (
          <View style={styles.card} key={index}>
            <View
              style={[
                styles.colorBadge,
                {
                  backgroundColor: hero.get('color'),
                },
              ]}
            />
            <Text style={styles.heroName}>{hero.get('name')}</Text>
            <TouchableOpacity
              onPress={() => removeHero(hero)}
              style={styles.alignRight}>
              <Image
                style={styles.deleteImage}
                source={require('../assets/deleteIcon.png')}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    backgroundColor: '#55C7F7',
    flex: 1,
  },
  title: {
    marginTop: 55,
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
  },
  heroesList: {
    marginTop: 30,
    borderRadius: 5,
    flex: 1,
    width: width - 30,
    paddingLeft: 15,
    marginHorizontal: 15,
    backgroundColor: 'white',
  },
  plusImage: {
    width: 30,
    height: 30,
    marginRight: 15,
    marginLeft: 'auto',
  },
  deleteImage: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  alignRight: {
    marginLeft: 'auto',
  },
  input: {
    flex: 1,
    color: '#D2DCE1',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',

    marginLeft: 12,
    paddingVertical: 15,
    borderBottomColor: '#D2DCE1',
    borderBottomWidth: 0.5,
  },
  colorBadge: {
    height: 30,
    width: 30,
    borderRadius: 15,
    marginRight: 15,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '200',
    marginTop: 3,
  },
  general: {
    marginTop: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  generalText: {
    fontSize: 18,
  },
});

export default Heroes;
