import { 
  CollectionReference, 
  DocumentReference, 
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  FieldValue,
  WhereFilterOp,
  OrderByDirection
} from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { FirestoreDocument, CreateInput, UpdateInput } from '../models/types';

/**
 * Base Repository class with common Firestore operations
 * Implements generic CRUD operations that can be extended by specific repositories
 */
export abstract class BaseRepository<T extends FirestoreDocument> {
  protected collection: CollectionReference;
  protected restaurantId: string;

  constructor(collectionPath: string, restaurantId: string) {
    this.restaurantId = restaurantId;
    this.collection = db.collection(`restaurants/${restaurantId}/${collectionPath}`);
  }

  /**
   * Create a new document
   */
  async create(data: CreateInput<T>): Promise<string> {
    try {
      const docRef = await this.collection.add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create document: ${error}`);
    }
  }

  /**
   * Get document by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }

      return this.transformDocument(doc);
    } catch (error) {
      throw new Error(`Failed to get document by ID: ${error}`);
    }
  }

  /**
   * Update document by ID
   */
  async update(id: string, data: UpdateInput<T>): Promise<void> {
    try {
      await this.collection.doc(id).update({
        ...data,
        updatedAt: FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await this.collection.doc(id).delete();
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.collection.doc(id).get();
      return doc.exists;
    } catch (error) {
      throw new Error(`Failed to check document existence: ${error}`);
    }
  }

  /**
   * Find documents with simple where clause
   */
  async findWhere(
    field: string, 
    operator: WhereFilterOp, 
    value: any,
    orderBy?: { field: string; direction?: OrderByDirection },
    limit?: number
  ): Promise<T[]> {
    try {
      let query: Query = this.collection.where(field, operator, value);

      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return this.transformSnapshot(snapshot);
    } catch (error) {
      throw new Error(`Failed to query documents: ${error}`);
    }
  }

  /**
   * Find all documents with optional ordering and limiting
   */
  async findAll(
    orderBy?: { field: string; direction?: OrderByDirection },
    limit?: number
  ): Promise<T[]> {
    try {
      let query: Query = this.collection;

      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return this.transformSnapshot(snapshot);
    } catch (error) {
      throw new Error(`Failed to get all documents: ${error}`);
    }
  }

  /**
   * Count documents in collection
   */
  async count(whereClause?: { field: string; operator: WhereFilterOp; value: any }): Promise<number> {
    try {
      let query: Query = this.collection;

      if (whereClause) {
        query = query.where(whereClause.field, whereClause.operator, whereClause.value);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      throw new Error(`Failed to count documents: ${error}`);
    }
  }

  /**
   * Batch operations
   */
  async batchCreate(items: CreateInput<T>[]): Promise<string[]> {
    const batch = db.batch();
    const ids: string[] = [];

    try {
      items.forEach((item) => {
        const docRef = this.collection.doc();
        ids.push(docRef.id);
        
        batch.set(docRef, {
          ...item,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      return ids;
    } catch (error) {
      throw new Error(`Failed to batch create documents: ${error}`);
    }
  }

  /**
   * Batch update
   */
  async batchUpdate(updates: { id: string; data: UpdateInput<T> }[]): Promise<void> {
    const batch = db.batch();

    try {
      updates.forEach(({ id, data }) => {
        const docRef = this.collection.doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to batch update documents: ${error}`);
    }
  }

  /**
   * Batch delete
   */
  async batchDelete(ids: string[]): Promise<void> {
    const batch = db.batch();

    try {
      ids.forEach((id) => {
        const docRef = this.collection.doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to batch delete documents: ${error}`);
    }
  }

  /**
   * Transform Firestore document to typed object
   */
  protected transformDocument(doc: DocumentSnapshot): T {
    const data = doc.data();
    if (!data) {
      throw new Error('Document data is undefined');
    }

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as T;
  }

  /**
   * Transform QuerySnapshot to array of typed objects
   */
  protected transformSnapshot(snapshot: QuerySnapshot): T[] {
    return snapshot.docs.map(doc => this.transformDocument(doc));
  }

  /**
   * Get collection reference (for advanced queries)
   */
  protected getCollection(): CollectionReference {
    return this.collection;
  }

  /**
   * Execute custom query
   */
  protected async executeQuery(query: Query): Promise<T[]> {
    try {
      const snapshot = await query.get();
      return this.transformSnapshot(snapshot);
    } catch (error) {
      throw new Error(`Failed to execute custom query: ${error}`);
    }
  }
}
