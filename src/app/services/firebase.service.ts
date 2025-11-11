import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from '@angular/fire/auth';
import { Firestore, deleteDoc, collection, addDoc, query, where, getDocs ,updateDoc, onSnapshot, doc, getDoc, limit, Query, DocumentData } from '@angular/fire/firestore'; 
import { Speciality } from '../interfaces/speciality';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {



   
  constructor(private auth: Auth, private firestore: Firestore)
  {
    
  }
  async getCollection(col: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, col);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error al obtener la colección', col, error);
      return [];
    }
  }
  signIn(email: string, password: string) 
  {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUp(email: string, password: string) 
  {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  addDocument(data: any, col: string) 
  {
    const dataRef = collection(this.firestore, col);
    return addDoc(dataRef, data);
  }

   async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const documentRef = doc(this.firestore, `${collectionName}/${docId}`);
      await deleteDoc(documentRef);
      console.log(`Documento con ID "${docId}" eliminado de la colección "${collectionName}".`);
    } catch (error) {
      console.error('Error eliminando el documento:', error);
      throw error;
    }
  }
async getAppointmentsByPatientUid(uidPaciente: string): Promise<any[]> {
  try {
    const appointmentsRef = collection(this.firestore, 'appointments');
    const q = query(appointmentsRef, where('patient.uid', '==', uidPaciente));
    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`🔹 Se encontraron ${appointments.length} turnos del paciente UID: ${uidPaciente}`);
    return appointments;
  } catch (error) {
    console.error("❌ Error al obtener los turnos del paciente:", error);
    throw error;
  }
}
  async verifyEmailUser(user: any): Promise<boolean> 
  {
    try 
    {
      await sendEmailVerification(user);
      return true; 
    } catch (error) 
    {
      console.error("Error al enviar verificación de email:", error);
      return false; 
    }
  }

  async signOut(): Promise<boolean> 
  {
  try 
  {
    await signOut(this.auth);
    
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
}

async getAllUniqueSpecialities(): Promise<Speciality[]> {
  const usersRef = collection(this.firestore, 'users');
  const q = query(usersRef, where('profile', '==', 'Especialista'));

  const snapshot = await getDocs(q);
  const especialidadesMap = new Map<string, Speciality>();

  snapshot.forEach((doc) => {
    const data: any = doc.data();
    if (Array.isArray(data.specialities)) {
      data.specialities.forEach((esp: Speciality) => {
        const nombre = esp.name?.trim();
        if (nombre && !especialidadesMap.has(nombre)) {
          especialidadesMap.set(nombre, esp);
        }
      });
    }
  });

  return Array.from(especialidadesMap.values());
}

async verifySpecialistAutorization(uid: string): Promise<boolean> 
{
  try {
    const docRef = doc(this.firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data['autorization'] === true;
    }
    return false;
  } catch (error) {
    console.error("Error al verificar autorización:", error);
    return false;
  }
}

async getUserByUID(uid: string, collectionName: string): Promise<any> {
  const usersRef = collection(this.firestore, collectionName);
  const q = query(usersRef, where('uid', '==', uid));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }

  return null;
}

async getSpecifyUsers(key: string, value: any, col: string): Promise<any[]> 
{
  const usersRef = collection(this.firestore, col);
  const q = query(usersRef, where(key, '==', value));
  const querySnapshot = await getDocs(q);

  const users: any[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  
  return users;
}

async getUsersWithFilters(filters: { key: string; value: any }[], col: string): Promise<any[]> {
  const usersRef = collection(this.firestore, col);


  const specialityFilter = filters.find(f => f.key === 'speciality');
  const otherFilters = filters.filter(f => f.key !== 'speciality');

  const buildQuery = (key: string) => {
    let q: any = usersRef;


    q = query(q, where(key, '==', specialityFilter?.value));

    for (const filter of otherFilters) {
      q = query(q, where(filter.key, '==', filter.value));
    }

    return q;
  };

  const [primarySnapshot, secondarySnapshot] = await Promise.all([
    getDocs(buildQuery('speciality')),
    getDocs(buildQuery('secondSpeciality'))
  ]);

  const usersMap = new Map<string, any>();

  primarySnapshot.forEach(doc => {
    usersMap.set(doc.id, { id: doc.id, ...(doc.data() as object) });
  });

  secondarySnapshot.forEach(doc => {
    usersMap.set(doc.id, { id: doc.id, ...(doc.data() as object) }); // evita duplicados por id
  });

  return Array.from(usersMap.values());
}

async getAllUsers(): Promise<any[]> 
{
  const usersRef = collection(this.firestore, 'users');
  const querySnapshot = await getDocs(usersRef);

  const usuarios: any[] = [];
  querySnapshot.forEach((doc) => {
    usuarios.push({ id: doc.id, ...doc.data() });
  });

  return usuarios;
}

async updateUser(id: string, data: any) 
{
  const userRef = doc(this.firestore, 'users', id);

  try {
    await updateDoc(userRef, data);
    console.log('Usuario actualizado correctamente');
  } catch (error) {
    console.error('Error actualizando usuario:', error);
  }
}


  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);
      await updateDoc(docRef, data);
      console.log(`Documento ${docId} actualizado en ${collectionName}`);
    } catch (error) {
      console.error("Error actualizando documento:", error);
      throw error;
    }
  }



async  autorizateUser(uid: string) {
  const usersRef = collection(this.firestore, 'users');
  const q = query(usersRef, where('uid', '==', uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) 
  {
    
    const docSnap = querySnapshot.docs[0];
    const docId = docSnap.id;

    const userRef = doc(this.firestore, 'users', docId);
    await updateDoc(userRef, { autorization: true });

    console.log('Usuario autorizado correctamente');
  } else {
    console.log('No se encontró usuario con ese uid');
  }
}

async getUserLogged() {
  const user = this.auth.currentUser;

  if (!user) return null;

  const uid = user.uid;

  const usersRef = collection(this.firestore, 'users');
  const q = query(usersRef, where('uid', '==', uid), limit(1));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
}
async getDocumentsWithFilters(filters: { key: string, value: any }[], collectionName: string): Promise<any[]> {
  const colRef = collection(this.firestore, collectionName);
  let q: Query = colRef;

  filters.forEach(filter => {
    q = query(q, where(filter.key, '==', filter.value));
  });

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


async getAppointments(uid: string, specialityType: string) {
  const appointmentsRef = collection(this.firestore, 'appointments');

  const q = query(
    appointmentsRef,
    where('specialist.uid', '==', uid),
    where('speciality', '==', specialityType)
  );

  const querySnapshot = await getDocs(q);
  const appointments: any[] = [];

 

  querySnapshot.forEach((doc) => {
    appointments.push({
      id: doc.id,
      ...doc.data()
    });
  });
 
  return appointments;
}

async updateSpecialityImageByName(specialityName: string, imageUrl: string): Promise<void> {
  try {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('profile', '==', 'Especialista'));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map(async (docSnap) => {
      const data: any = docSnap.data();

      if (Array.isArray(data.specialities)) {

        const updatedSpecialities = data.specialities.map((esp: any) => {
          if (esp.name?.trim().toLowerCase() === specialityName.trim().toLowerCase()) {
            return { ...esp, specialityImage: imageUrl };
          }
          return esp;
        });

        const userRef = doc(this.firestore, 'users', docSnap.id);
        await updateDoc(userRef, { specialities: updatedSpecialities });
      }
    });

    await Promise.all(updates);
    console.log(`✅ Imagen actualizada para todas las especialidades "${specialityName}"`);
  } catch (error) {
    console.error("❌ Error al actualizar las imágenes de especialidad:", error);
  }
}
}
