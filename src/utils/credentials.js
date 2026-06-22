// Credential helpers for the role-based login system.
//
// Students log in with their admission number (stored as users.username) and a
// default password derived from their birth year + the first 4 letters of their
// name, e.g. name "Shikha Nath" born 2003 -> "2003shik".

// Returns the first 4 alphabetic characters of a name, lowercased.
// Falls back to whatever letters exist if the name is shorter than 4.
function nameSlug(name) {
  const letters = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  return letters.slice(0, 4);
}

// year-of-birth + first 4 letters of name, e.g. "2003shik".
// dateOfBirth may be a Date or a string like "2003-05-12".
function generateStudentPassword(name, dateOfBirth) {
  const slug = nameSlug(name);
  const year = dateOfBirth ? new Date(dateOfBirth).getFullYear() : '';
  if (!year || Number.isNaN(year)) {
    throw new Error('Cannot generate student password: a valid date_of_birth is required');
  }
  return `${year}${slug}`;
}

module.exports = { generateStudentPassword, nameSlug };
