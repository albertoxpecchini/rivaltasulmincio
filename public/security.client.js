(function (global) {
  'use strict';

  var STORAGE_PREFIX = 'rsm_sec_v1_';
  var memoryStore = {};

  var DEFAULT_BLOCKED_WORDS = [
    'vaffanculo',
    'stronzo',
    'coglione',
    'merda',
    'idiota',
    'cretino',
    'troia',
    'puttana',
    'odio',
    'razzista',
    'violenza'
  ];

  function normalizeIdentity(value) {
    return String(value || 'anonymous').trim().toLowerCase() || 'anonymous';
  }

  function getStoreKey(action, identity) {
    return STORAGE_PREFIX + String(action || 'generic') + '__' + normalizeIdentity(identity);
  }

  function readBucket(key) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) {
        return { attempts: [], lockedUntil: 0 };
      }
      var parsed = JSON.parse(raw);
      return {
        attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
        lockedUntil: Number(parsed.lockedUntil || 0)
      };
    } catch (err) {
      var mem = memoryStore[key];
      return mem ? mem : { attempts: [], lockedUntil: 0 };
    }
  }

  function writeBucket(key, bucket) {
    var clean = {
      attempts: Array.isArray(bucket.attempts) ? bucket.attempts : [],
      lockedUntil: Number(bucket.lockedUntil || 0)
    };
    try {
      global.localStorage.setItem(key, JSON.stringify(clean));
    } catch (err) {
      memoryStore[key] = clean;
    }
  }

  function pruneAttempts(attempts, windowMs, nowTs) {
    var minTs = nowTs - windowMs;
    return attempts.filter(function (ts) { return Number(ts) >= minTs; });
  }

  function checkRateLimit(action, identity, cfg) {
    var nowTs = Date.now();
    var options = cfg || {};
    var maxAttempts = Number(options.maxAttempts || 5);
    var windowMs = Number(options.windowMs || 10 * 60 * 1000);
    var lockMs = Number(options.lockMs || 15 * 60 * 1000);

    var key = getStoreKey(action, identity);
    var bucket = readBucket(key);
    bucket.attempts = pruneAttempts(bucket.attempts, windowMs, nowTs);

    if (bucket.lockedUntil && bucket.lockedUntil > nowTs) {
      writeBucket(key, bucket);
      return {
        ok: false,
        retryAfterMs: bucket.lockedUntil - nowTs,
        attempts: bucket.attempts.length
      };
    }

    if (bucket.attempts.length >= maxAttempts) {
      bucket.lockedUntil = nowTs + lockMs;
      writeBucket(key, bucket);
      return {
        ok: false,
        retryAfterMs: lockMs,
        attempts: bucket.attempts.length
      };
    }

    writeBucket(key, bucket);
    return { ok: true, retryAfterMs: 0, attempts: bucket.attempts.length };
  }

  function recordRateFailure(action, identity, cfg) {
    var nowTs = Date.now();
    var options = cfg || {};
    var maxAttempts = Number(options.maxAttempts || 5);
    var windowMs = Number(options.windowMs || 10 * 60 * 1000);
    var lockMs = Number(options.lockMs || 15 * 60 * 1000);

    var key = getStoreKey(action, identity);
    var bucket = readBucket(key);
    bucket.attempts = pruneAttempts(bucket.attempts, windowMs, nowTs);
    bucket.attempts.push(nowTs);
    if (bucket.attempts.length >= maxAttempts) {
      bucket.lockedUntil = nowTs + lockMs;
    }
    writeBucket(key, bucket);
  }

  function clearRateFailures(action, identity) {
    var key = getStoreKey(action, identity);
    writeBucket(key, { attempts: [], lockedUntil: 0 });
  }

  function formatRetry(ms) {
    var total = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    if (minutes <= 0) {
      return seconds + 's';
    }
    return minutes + 'm ' + seconds + 's';
  }

  function escapeForRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeForScan(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function countLinks(text) {
    var links = String(text || '').match(/https?:\/\/|www\./gi);
    return links ? links.length : 0;
  }

  function detectRepeatedLines(text, maxRepeatedLine) {
    var lines = String(text || '')
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(Boolean);

    if (!lines.length) {
      return false;
    }

    var counts = {};
    for (var i = 0; i < lines.length; i += 1) {
      var key = lines[i].toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxRepeatedLine) {
        return true;
      }
    }
    return false;
  }

  function detectUppercaseSpam(text) {
    var src = String(text || '');
    if (src.length < 40) {
      return false;
    }
    var letters = src.replace(/[^a-zA-Z]/g, '');
    if (!letters.length) {
      return false;
    }
    var upper = letters.replace(/[^A-Z]/g, '').length;
    return upper / letters.length > 0.78;
  }

  function containsBlockedWord(text, words) {
    var source = normalizeForScan(text);
    var list = Array.isArray(words) && words.length ? words : DEFAULT_BLOCKED_WORDS;

    for (var i = 0; i < list.length; i += 1) {
      var word = String(list[i] || '').trim().toLowerCase();
      if (!word) {
        continue;
      }
      var escaped = escapeForRegex(word);
      var pattern = new RegExp('(^|\\W)' + escaped + '(\\W|$)', 'i');
      if (pattern.test(source)) {
        return word;
      }
    }

    return null;
  }

  function evaluateTextSafety(text, cfg) {
    var options = cfg || {};
    var minChars = Number(options.minChars || 3);
    var maxChars = Number(options.maxChars || 12000);
    var maxLinks = Number(options.maxLinks || 4);
    var maxRepeatedChar = Number(options.maxRepeatedChar || 7);
    var maxRepeatedLine = Number(options.maxRepeatedLine || 3);
    var blockedWords = options.blockedWords || DEFAULT_BLOCKED_WORDS;

    var raw = String(text || '');
    var compact = raw.replace(/\s+/g, ' ').trim();

    if (compact.length < minChars) {
      return { ok: false, message: 'Testo troppo breve.' };
    }

    if (compact.length > maxChars) {
      return { ok: false, message: 'Testo troppo lungo.' };
    }

    if (countLinks(raw) > maxLinks) {
      return { ok: false, message: 'Troppi link nel testo. Riduci i collegamenti esterni.' };
    }

    var repeatedCharPattern = new RegExp('(.)\\1{' + maxRepeatedChar + ',}', 'i');
    if (repeatedCharPattern.test(raw)) {
      return { ok: false, message: 'Testo rilevato come spam (ripetizioni eccessive).' };
    }

    if (detectRepeatedLines(raw, maxRepeatedLine)) {
      return { ok: false, message: 'Testo rilevato come spam (righe ripetute).' };
    }

    if (detectUppercaseSpam(raw)) {
      return { ok: false, message: 'Testo rilevato come spam (uso eccessivo di maiuscole).' };
    }

    var blockedWord = containsBlockedWord(raw, blockedWords);
    if (blockedWord) {
      return {
        ok: false,
        message: 'Il testo contiene una parola non consentita: "' + blockedWord + '".'
      };
    }

    return { ok: true, message: '' };
  }

  global.RSM_SECURITY = {
    checkRateLimit: checkRateLimit,
    recordRateFailure: recordRateFailure,
    clearRateFailures: clearRateFailures,
    formatRetry: formatRetry,
    evaluateTextSafety: evaluateTextSafety,
    defaultBlockedWords: DEFAULT_BLOCKED_WORDS.slice()
  };
})(window);
