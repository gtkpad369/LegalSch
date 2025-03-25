
import { storage } from '../storage';
import { addDays } from 'date-fns';
import fs from 'fs/promises';
import path from 'path';

export class DocumentCleanupService {
  static async cleanupExpiredDocuments(): Promise<number> {
    const documents = await storage.getClientDocuments();
    let deletedCount = 0;

    for (const doc of documents) {
      if (new Date() > new Date(doc.expirationDate)) {
        try {
          // Delete file from filesystem
          await fs.unlink(doc.filePath);
          // Delete from storage
          await storage.deleteClientDocument(doc.id);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete document ${doc.id}:`, error);
        }
      }
    }

    return deletedCount;
  }
}
