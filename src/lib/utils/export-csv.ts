export interface CSVExportRow {
  submissionId: string;
  fullName: string;
  school: string;
  phone: string;
  email: string;
  debateTopic: string;
  status: string;
  submittedAt: string;
  totalScore?: string | number;
}

export function generateSubmissionsCSV(rows: CSVExportRow[]): string {
  const headers = [
    'Submission ID',
    'Participant Name',
    'School',
    'Phone',
    'Email',
    'Debate Topic',
    'Status',
    'Submitted At',
    'Total Score',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      [
        escapeCSV(row.submissionId),
        escapeCSV(row.fullName),
        escapeCSV(row.school),
        escapeCSV(row.phone),
        escapeCSV(row.email),
        escapeCSV(row.debateTopic),
        escapeCSV(row.status),
        escapeCSV(row.submittedAt),
        escapeCSV(row.totalScore ?? 'N/A'),
      ].join(',')
    ),
  ];

  return csvRows.join('\r\n');
}
