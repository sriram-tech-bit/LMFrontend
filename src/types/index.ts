export type MemberStatus = 'active' | 'suspended';
export type BorrowStatus = 'issued' | 'returned' | 'overdue';

export interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies?: number;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  _id?: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  phone?: string;
  status: MemberStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRecord {
  id: string;
  _id?: string;
  book: string | Pick<Book, 'id' | 'title' | 'author' | 'isbn' | 'genre'>;
  member: string | Pick<Member, 'id' | 'name' | 'email' | 'membershipId' | 'status'>;
  issuedBy?: string | null;
  receivedBy?: string | null;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  notes?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  daysUntilDue?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface MemberHistory {
  member: Member;
  summary: {
    totalBorrows: number;
    returned: number;
    active: number;
    overdue: number;
    neverReturnedAndNotActive: number;
  };
  records: BorrowRecord[];
}
