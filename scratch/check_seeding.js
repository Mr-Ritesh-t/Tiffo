import { collection, getDocs } from 'firebase/firestore'
import { db } from './src/services/firebase.js'
import { paths } from './src/services/firestorePaths.js'

async function checkSeeding() {
  try {
    const querySnapshot = await getDocs(collection(db, paths.messes()))
    console.log(`Found ${querySnapshot.size} messes in the database.`)
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`, doc.data().name)
    })
  } catch (e) {
    console.error("Error checking seeding: ", e)
  }
}

checkSeeding()
