import { Injectable } from '@angular/core';
import { addDoc, collectionData, deleteDoc, doc, Firestore, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ProductList, RegisterUser, PurchaseList, RentProductList, RentList, ExpensesList, BalanceList } from '../interface/invoice';
import { collection } from '@firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  
  constructor(private fService: Firestore, private authentication: Auth) { }


  /////////////////////// registerUser List ////////////////////////


  addUserList(data: RegisterUser) {
    data.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'RegisterUser'), data)
  }

  getUserList() {
    let dataRef = collection(this.fService, 'RegisterUser')
    return collectionData(dataRef, { idField: 'id' })
  }


  /////////////////////// Product List Data ////////////////////////


  addProduct(payload: ProductList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'ProductList'), payload)
  }

  getAllProduct() {
    let dataRef = collection(this.fService, 'ProductList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteProduct(deleteId: any) {
    let docRef = doc(collection(this.fService, 'ProductList'), deleteId);
    return deleteDoc(docRef)
  }

  updateProduct(updateId: ProductList, payload: any) {
    let dataRef = doc(this.fService, `ProductList/${updateId}`);
    return updateDoc(dataRef, payload)
  }


  
  /////////////////////// Purchase List Data ////////////////////////


  addPurchase(payload: PurchaseList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'PurchaseList'), payload)
  }

  getAllPurchase() {
    let dataRef = collection(this.fService, 'PurchaseList')
    return collectionData(dataRef, { idField: 'id' })
  }

  updatePurchase(updateId: PurchaseList, payload: any) {
    let dataRef = doc(this.fService, `PurchaseList/${updateId}`);
    return updateDoc(dataRef, payload)
  }

  deletePurchase(deleteId: any) {
    let docRef = doc(collection(this.fService, 'PurchaseList'), deleteId);
    return deleteDoc(docRef)
  }


    /////////////////////// Rent Product List Data ////////////////////////


  addRentProduct(payload: RentProductList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'RentProductList'), payload)
  }

  getAllRentProduct() {
    let dataRef = collection(this.fService, 'RentProductList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteRentProduct(deleteId: any) {
    let docRef = doc(collection(this.fService, 'RentProductList'), deleteId);
    return deleteDoc(docRef)
  }

  updateRentProduct(updateId: RentProductList, payload: any) {
    let dataRef = doc(this.fService, `RentProductList/${updateId}`);
    return updateDoc(dataRef, payload)
  }



    /////////////////////// Rent List Data ////////////////////////


  addRent(payload: RentList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'RentList'), payload)
  }

  getAllRent() {
    let dataRef = collection(this.fService, 'RentList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteRent(deleteId: any) {
    let docRef = doc(collection(this.fService, 'RentList'), deleteId);
    return deleteDoc(docRef)
  }

  updateRent(updateId: RentList, payload: any) {
    let dataRef = doc(this.fService, `RentList/${updateId}`);
    return updateDoc(dataRef, payload)
  }

    /////////////////////// Expenses List Data ////////////////////////


  addExpenses(payload: ExpensesList) {
    payload.id = doc(collection(this.fService, 'id')).id
    return addDoc(collection(this.fService, 'ExpensesList'), payload)
  }

  getAllExpenses() {
    let dataRef = collection(this.fService, 'ExpensesList')
    return collectionData(dataRef, { idField: 'id' })
  }

  deleteExpenses(deleteId: any) {
    let docRef = doc(collection(this.fService, 'ExpensesList'), deleteId);
    return deleteDoc(docRef)
  }

  updateExpenses(updateId: ExpensesList, payload: any) {
    let dataRef = doc(this.fService, `ExpensesList/${updateId}`);
    return updateDoc(dataRef, payload)
  }

   /////////////////////// Balance List Data ////////////////////////


  // addBalance(payload: BalanceList) {
  //   payload.id = doc(collection(this.fService, 'id')).id
  //   return addDoc(collection(this.fService, 'BalanceList'), payload)
  // }

  
  addBalance(payload: BalanceList): Observable<any> {
    payload.id = doc(collection(this.fService, 'BalanceList')).id;
    const collectionRef = collection(this.fService, 'BalanceList');
    return from(addDoc(collectionRef, payload));
  }

  getUserBalance() {
    let dataRef = collection(this.fService, 'BalanceList')
    return collectionData(dataRef, { idField: 'id' })
  }

  getAllBalance() {
    let dataRef = collection(this.fService, 'BalanceList')
    return collectionData(dataRef, { idField: 'id' })
  }

  // updateBalance(updateId: BalanceList, payload: any) {
  //   let dataRef = doc(this.fService, `BalanceList/${updateId}`);
  //   return updateDoc(dataRef, payload)
  // }

  updateBalance(updateId: string, payload: any): Observable<void> {
    const dataRef = doc(this.fService, `BalanceList/${updateId}`);
    const updatePromise = updateDoc(dataRef, payload);
    return from(updatePromise); // Converts Promise to Observable
  }

  deleteBalance(deleteId: any) {
    let docRef = doc(collection(this.fService, 'BalanceList'), deleteId);
    return deleteDoc(docRef)
  }

}




