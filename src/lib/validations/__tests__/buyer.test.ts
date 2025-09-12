import { createBuyerSchema, csvImportRowSchema } from '../buyer';

describe('Buyer Validation', () => {
  describe('createBuyerSchema', () => {
    it('should validate a valid buyer with all required fields', () => {
      const validBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should validate a buyer with optional fields', () => {
      const validBuyer = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        city: 'Mohali',
        propertyType: 'Villa',
        bhk: '3',
        purpose: 'Rent',
        budgetMin: 5000000,
        budgetMax: 8000000,
        timeline: '0-3m',
        source: 'Referral',
        notes: 'Looking for a villa with garden',
        tags: ['premium', 'garden'],
      };

      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should reject buyer with invalid phone number', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        phone: '123', // Too short
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Phone must be 10-15 digits');
      }
    });

    it('should reject buyer with invalid email', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        email: 'invalid-email',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email address');
      }
    });

    it('should reject apartment/villa without BHK', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        // bhk missing
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('BHK is required for Apartment and Villa properties');
      }
    });

    it('should reject buyer with budgetMax < budgetMin', () => {
      const invalidBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: 8000000,
        budgetMax: 5000000, // Less than min
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum budget must be greater than or equal to minimum budget');
      }
    });

    it('should allow non-residential properties without BHK', () => {
      const validBuyer = {
        fullName: 'John Doe',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Plot', // Non-residential
        // bhk missing - should be allowed
        purpose: 'Buy',
        timeline: '3-6m',
        source: 'Website',
      };

      const result = createBuyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });
  });

  describe('csvImportRowSchema', () => {
    it('should validate a valid CSV row', () => {
      const validRow = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '5000000',
        budgetMax: '8000000',
        timeline: '3-6m',
        source: 'Website',
        notes: 'Looking for 2BHK',
        tags: 'premium,apartment',
        status: 'New',
      };

      const result = csvImportRowSchema.safeParse(validRow);
      expect(result.success).toBe(true);
    });

    it('should transform string numbers to numbers', () => {
      const row = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '5000000',
        budgetMax: '8000000',
        timeline: '3-6m',
        source: 'Website',
        notes: 'Looking for 2BHK',
        tags: 'premium,apartment',
        status: 'New',
      };

      const result = csvImportRowSchema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.budgetMin).toBe('number');
        expect(typeof result.data.budgetMax).toBe('number');
        expect(result.data.budgetMin).toBe(5000000);
        expect(result.data.budgetMax).toBe(8000000);
      }
    });

    it('should transform comma-separated tags to array', () => {
      const row = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '',
        budgetMax: '',
        timeline: '3-6m',
        source: 'Website',
        notes: 'Looking for 2BHK',
        tags: 'premium,apartment,garden',
        status: 'New',
      };

      const result = csvImportRowSchema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(['premium', 'apartment', 'garden']);
      }
    });

    it('should handle empty tags string', () => {
      const row = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Chandigarh',
        propertyType: 'Apartment',
        bhk: '2',
        purpose: 'Buy',
        budgetMin: '',
        budgetMax: '',
        timeline: '3-6m',
        source: 'Website',
        notes: 'Looking for 2BHK',
        tags: '',
        status: 'New',
      };

      const result = csvImportRowSchema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
      }
    });
  });
});
