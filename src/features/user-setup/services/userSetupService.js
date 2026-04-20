import { userSetupAddresses, userSetupDocuments, userSetupUsers } from '../data/userSetupData';

const USER_KEY = 'hrms_user_setup_users';
const DOCUMENT_KEY = 'hrms_user_setup_documents';
const ADDRESS_KEY = 'hrms_user_setup_addresses';

function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadUserSetupUsers() {
  return readStorage(USER_KEY, userSetupUsers);
}

export function saveUserSetupUsers(users) {
  writeStorage(USER_KEY, users);
}

export function loadUserSetupDocuments() {
  return readStorage(DOCUMENT_KEY, userSetupDocuments);
}

export function saveUserSetupDocuments(documents) {
  writeStorage(DOCUMENT_KEY, documents);
}

export function loadUserSetupAddresses() {
  return readStorage(ADDRESS_KEY, userSetupAddresses);
}

export function saveUserSetupAddresses(addresses) {
  writeStorage(ADDRESS_KEY, addresses);
}
