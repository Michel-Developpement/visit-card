import { CardFirebase, CardSchemaFirebase } from "@/types/card";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ShortUniqueId from "short-unique-id";
import { database } from "../firebase/firebase.config";
import useAccount from "./useAccount";

const useCard = (user: User | null) => {
  const COLLECTION_CARDS_FIRESTORE = "cards";

  const { getCardId, createCardId } = useAccount(user);

  const editCard = async (data: CardFirebase) => {
    if (!user) return;

    const cardId = await getCardId();
    if (cardId) {
      const docRef = doc(database, COLLECTION_CARDS_FIRESTORE, cardId);
      await setDoc(docRef, data, { merge: true });
    } else {
      const CARD_ID_LENGTH = 10;
      const cardId = new ShortUniqueId({ length: CARD_ID_LENGTH });
      const randomCardId = cardId.rnd();

      //dans la collection user, document userId, écriture du numéro de carte Id
      await createCardId(randomCardId);
      // dans la collections card, document cardId, écriture de la data
      await setDoc(
        doc(database, COLLECTION_CARDS_FIRESTORE, randomCardId),
        data,
        { merge: true }
      );
    }
  };

  const isCardCreated = async () => {
    if (!user) return;
    const cardId = await getCardId();
    return Boolean(cardId);
  };

  const getCard = async () => {
    if (!user) return;
    const cardId = await getCardId();

    if (!cardId) return;
    const docRef = doc(database, COLLECTION_CARDS_FIRESTORE, cardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = CardSchemaFirebase.parse(docSnap.data());

      return data;
    } else {
      return null;
    }
  };
  const getCardById = async () => {
    const cardId = await getCardId();
    if (!cardId) return;
    const docRef = doc(database, COLLECTION_CARDS_FIRESTORE, cardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = CardSchemaFirebase.parse(docSnap.data());
      return data;
    } else {
      throw new Error("la carte n'existe pas");
    }
  };

  const cardQueryKey = ["card"];
  const cardMutationKey = ["card"];
  const isCardCreatedQueryKey = ["isCardCreated"];

  return {
    editCard,
    getCardById,
    isCardCreated,
    getCard,
    cardMutationKey,
    cardQueryKey,
    isCardCreatedQueryKey,
  };
};

export default useCard;