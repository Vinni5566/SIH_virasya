'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

function isBandwidthOrQuotaError(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code === 'unavailable' ||
    msg.includes('resource-exhausted') ||
    msg.includes('maximum bandwidth') ||
    msg.includes('quota') ||
    msg.includes('backoff')
  );
}

function saveLocalBackup(key: string, data: any) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`virasya_backup_${key}`, JSON.stringify(data));
    }
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch((error: any) => {
    if (isBandwidthOrQuotaError(error)) {
      console.warn('Firestore write throttled (bandwidth limit). Saved to local backup.');
      saveLocalBackup(docRef.path, data);
      return;
    }

    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    );
  });
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch((error: any) => {
      if (isBandwidthOrQuotaError(error)) {
        console.warn('Firestore write throttled (bandwidth limit). Saved to local backup.');
        saveLocalBackup(`${colRef.path}_${Date.now()}`, data);
        return null;
      }

      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch((error: any) => {
      if (isBandwidthOrQuotaError(error)) {
        console.warn('Firestore write throttled (bandwidth limit). Saved to local backup.');
        saveLocalBackup(docRef.path, data);
        return;
      }

      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch((error: any) => {
      if (isBandwidthOrQuotaError(error)) {
        return;
      }

      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    });
}