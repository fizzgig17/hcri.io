// Licenses a report can carry. '' (nothing chosen) means all rights reserved.
// Keep in step with REPORT_LICENSES in api/_core/user_prefs.php.
export const LICENSES = [
  { id: '',          label: 'All rights reserved',                       short: 'All rights reserved', url: '' },
  { id: 'cc0',       label: 'CC0: public domain, no rights reserved',    short: 'CC0',            url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { id: 'by',        label: 'CC BY: credit me',                          short: 'CC BY 4.0',      url: 'https://creativecommons.org/licenses/by/4.0/' },
  { id: 'by-sa',     label: 'CC BY-SA: credit me, share alike',          short: 'CC BY-SA 4.0',   url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { id: 'by-nc',     label: 'CC BY-NC: credit me, non-commercial only',  short: 'CC BY-NC 4.0',   url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { id: 'by-nd',     label: 'CC BY-ND: credit me, no changes',           short: 'CC BY-ND 4.0',   url: 'https://creativecommons.org/licenses/by-nd/4.0/' },
  { id: 'by-nc-sa',  label: 'CC BY-NC-SA: credit, non-commercial, share alike', short: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  { id: 'by-nc-nd',  label: 'CC BY-NC-ND: credit, non-commercial, no changes',  short: 'CC BY-NC-ND 4.0', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' },
];
export const licenseInfo = (id) => LICENSES.find((l) => l.id === (id || '')) || LICENSES[0];
export const LICENSE_HELP_URL = '/help/#report-licenses';
