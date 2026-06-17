import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ detail: message }, { status });
}

export function toPublicRow<T extends { id: string }>(row: T) {
  return { ...row, id: row.id };
}

export function mapAnnouncement(row: {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    priority: row.priority,
    created_by: row.createdBy,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt?.toISOString(),
  };
}

export function mapEvent(row: {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    category: row.category,
    image_url: row.imageUrl || "",
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt?.toISOString(),
  };
}

export function mapGallery(row: {
  id: string;
  title: string;
  category: string;
  description: string | null;
  blobUrl: string;
  contentType: string | null;
  size: number | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description || "",
    storage_path: row.blobUrl,
    content_type: row.contentType,
    size: row.size,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapAdmission(row: {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  previousSchool: string | null;
  classApplying: string;
  stream: string | null;
  additionalInfo: string | null;
  status: string;
  submittedAt: Date;
}) {
  return {
    id: row.id,
    student_name: row.studentName,
    parent_name: row.parentName,
    email: row.email,
    phone: row.phone,
    date_of_birth: row.dateOfBirth,
    gender: row.gender,
    address: row.address,
    previous_school: row.previousSchool || "",
    class_applying: row.classApplying,
    stream: row.stream || "",
    additional_info: row.additionalInfo || "",
    status: row.status,
    submitted_at: row.submittedAt.toISOString(),
  };
}

export function mapContact(row: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  submittedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    subject: row.subject,
    message: row.message,
    status: row.status,
    submitted_at: row.submittedAt.toISOString(),
  };
}

export function mapStudent(row: {
  id: string;
  name: string;
  dateOfBirth: string;
  birthMonth: number;
  birthDay: number;
  className: string | null;
  section: string | null;
  gender: string | null;
}) {
  return {
    id: row.id,
    name: row.name,
    date_of_birth: row.dateOfBirth,
    birth_month: row.birthMonth,
    birth_day: row.birthDay,
    class_name: row.className || "",
    section: row.section || "",
    gender: row.gender || "",
  };
}
