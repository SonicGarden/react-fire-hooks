import { collection, doc, getFirestore } from 'firebase/firestore';

const fruitsRef = () => collection(getFirestore(), 'fruits');
const fruitRef = (id: string) => doc(fruitsRef(), id);
const vegetablesRef = () => collection(getFirestore(), 'vegetables');
const vegetableRef = (id: string) => doc(vegetablesRef(), id);

export { fruitsRef, fruitRef, vegetablesRef, vegetableRef };
