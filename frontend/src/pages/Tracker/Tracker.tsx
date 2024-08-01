import React, { useState, useEffect } from "react"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod" 

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, getDoc, deleteField } from 'firebase/firestore';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {

  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pantrySchema = z.object({
    name: z.string().min(1, { message: "Please enter a name!" }),
    count: z.number({ invalid_type_error: "Count has to be greater than 0!" }).min(1),
    expirationDate: z.date(),
});

type pantryData = z.infer<typeof pantrySchema>;

const insertDocument = async(document, item: pantryData) => 
{
    const docRef = doc(collection(db, "inventory"), document); // Get ref

    const snap = await getDoc(docRef); // Get the document 

    if(snap.exists()) // If the document exists, update it instead of overwriting 
    {
        await updateDoc(docRef, 
        { 
            [item.name]: 
            {
                count: item.count,
                expirationDate: typeof item.expirationDate === "string" ? item.expirationDate : item.expirationDate.toDateString()
            }
        });
    }
    else // Document doesn't exist, create it
    {
        await setDoc(docRef, 
        { 
            [item.name]: 
            {
                count: item.count,
                expirationDate: typeof item.expirationDate === "string" ? item.expirationDate : item.expirationDate.toDateString()
            }
        });
    }
}

const removeField = async(document, item: pantryData) => 
{
    const docRef = doc(collection(db, "inventory"), document); // Get ref

    const snap = await getDoc(docRef); // Get the document 

    if(snap.exists()) // If the document exists, update it instead of overwriting 
    {
        await updateDoc(docRef, 
        { 
            [item.name]: deleteField()
        });
    }
}

const fetchDocument = async(document) =>
{
    const docRef = doc(collection(db, "inventory"), document); // Get ref

    const snap = await getDoc(docRef); // Get the document 

    if(snap.exists())
    {
        return { ...snap.data() }
    }
}

    
const Tracker = () => 
{
    const 
    {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<pantryData>({ resolver: zodResolver(pantrySchema) });

    const [itemPopupVis, setItemPopupVis ] = useState(false);
    const [items, setItems] = useState<pantryData[]>([]);
    const [hash, setHash] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => 
    {
        const params = new URLSearchParams(window.location.search);
        const hash = params.get("hash");
        
        if(hash)
        {    
            setHash(hash);

            fetchDocument(hash).then((data) => 
            {
                if(data)
                {
                    const savedItems: pantryData[] = Object.keys(data).map((key) => 
                    {
                        return {
                            name: key.length > 15 ? ( key.substring(0, 15) + "..." ) : key,
                            count: data[key]["count"],
                            expirationDate: data[key]["expirationDate"], 
                        };
                    });
    
                    setItems(savedItems);
                }
            })
        }
        else
            setHash(window.crypto.randomUUID());

        
    }, []);

    const addItem = async (item: pantryData) => 
    {
        await insertDocument(hash, item);

        if(item.name.length > 15)
            item.name = item.name.substring(0, 15) + "...";

        setItems([...items, item]);
    };

    const updateItem = async (newitem: pantryData, index: number) => 
    {
        if(newitem.count <= 0)
        {
            await removeField(hash, newitem);

            setItems(items.splice(index, 1));
        }
        else
        {
            const updatedMap = items.map(async (item, itemIndex) => 
            {
                if(itemIndex === index)
                {
                    await insertDocument(hash, newitem);
                    
                    return newitem;
                }
        
                return item;
            })

            setItems(await Promise.all(updatedMap));
        }
    };

    const onSubmit = (data: pantryData) => 
    {
        addItem(data);
        setItemPopupVis(false);
        reset(); 
    };
    
    return (
        <main className="flex flex-col flex-grow p-4 items-center gap-2">   
            <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-0 md:space-x-4">
                <h1 style={{ fontSize: "clamp(2rem, 3vw, 80px)" }} className="font-bold">
                    My Pantry
                </h1>

                <div className="flex flex-col md:flex-row items-center w-full md:w-auto space-y-4 md:space-y-0 md:space-x-4">
                    <input onChange={(text) => setSearch(text.target.value.toLocaleLowerCase()) } type="text" placeholder="Search items..." className="w-full h-[40px] px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#b6465f] focus:border-transparent"/>
                    
                    <div className="flex flex-row items-center gap-2 mt-4 md:mt-0">
                        <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="rounded-full bg-[#313131] h-[40px] w-[100px] text-white">
                            Share
                        </button>

                        <button onClick={() => setItemPopupVis(!itemPopupVis)} className="rounded-full bg-[#b6465f] h-[40px] w-[100px] text-white">
                            Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full">
                <table className="border border-gray-600 w-full">
                    <thead>
                        <tr className="text-left border-b border-gray-600">
                            <th className="p-2">Item</th>
                            <th className="p-2">Count</th>
                            <th className="p-2">Expiration Date</th>
                            <th className="p-2 w-1/4">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            items.map((item, key) => 
                            (
                                item.name.toLowerCase().includes(search) && <tr key={key}>
                                    <td className="border-b border-gray-600 p-2">{item.name}</td>
                                    <td className="border-b border-gray-600 p-2">{item.count}</td>
                                    <td className="border-b border-gray-600 p-2">{typeof item.expirationDate === "string" ? item.expirationDate : item.expirationDate.toDateString()}</td>
                                    <td className="border-b border-gray-600 p-2">
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => updateItem({name: item.name, expirationDate: item.expirationDate, count: item.count + 1}, key)} className="rounded-full bg-[#6baa5f] h-auto w-[25px] text-white">
                                                +
                                            </button>

                                            <button onClick={() => { updateItem({name: item.name, expirationDate: item.expirationDate, count: item.count - 1}, key) } } className="rounded-full bg-[#aa4345] h-auto w-[25px] text-white">
                                                -
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) 
                        }
                    </tbody>
                </table>
            </div>

        {itemPopupVis && 
        (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white rounded-lg p-4 w-1/2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Add New Item</h2>
                        <button onClick={() => setItemPopupVis(false)} className="text-black text-lg">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Item Name:</label>
                            <input {...register("name")} type="text" className="w-full border border-gray-300 rounded p-2" />
                            {errors.name && (
                                <span className="text-red-500">{errors.name.message}</span>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Count:</label>
                            <input {...register("count", { valueAsNumber: true })} type="number" className="w-full border border-gray-300 rounded p-2" />
                            {errors.count && (
                                <span className="text-red-500">{errors.count.message}</span>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Expiration Date:</label>
                            <input {...register("expirationDate", { valueAsDate: true })} type="date" className="w-full border border-gray-300 rounded p-2" />
                            {errors.expirationDate && (
                                <span className="text-red-500">{errors.expirationDate.message}</span>
                            )}
                        </div>
                        
                        <div className="flex justify-start">
                            <button
                            type="submit"
                            className="bg-[#b6465f] rounded text-white p-2"
                            onClick={() => console.log(false)}
                            >
                            Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </main>
    )
}

export default Tracker