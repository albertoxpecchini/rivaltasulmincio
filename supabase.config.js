// Configurazione Supabase condivisa.
// Priorita in locale (localhost/127.0.0.1):
// 1) query string (?sbUrl=...&sbKey=...)
// 2) localStorage (salvato da /db-test)
// 3) credenziali incorporate qui sotto
// In ambienti non locali gli override vengono ignorati.

var SUPABASE_URL;
var SUPABASE_ANON_KEY;

(function () {
	var STORAGE_KEY = 'rsm_supabase_config_v1';
	var DEFAULT_CONFIG = {
		url: 'https://tljwxymcavgpzntksjtx.supabase.co',
		anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsand4eW1jYXZncHpudGtzanR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyODM2MzksImV4cCI6MjA5Mjg1OTYzOX0.4mLVUxTO2SGeVWDDn7Vw0NuSDB82T3v6IWO-BVlrzC0'
	};
	var source = 'embedded';
	var allowOverride = false;

	function safeTrim(value) {
		return typeof value === 'string' ? value.trim() : '';
	}

	function isLocalRuntime() {
		if (typeof window === 'undefined' || !window.location) return false;
		var host = safeTrim(window.location.hostname).toLowerCase();
		return host === 'localhost' || host === '127.0.0.1' || host === '::1';
	}

	function isValidUrl(value) {
		var url = safeTrim(value);
		if (!url) return false;
		try {
			var parsed = new URL(url);
			return parsed.protocol === 'https:' || parsed.protocol === 'http:';
		} catch (_) {
			return false;
		}
	}

	function isValidAnonKey(value) {
		return safeTrim(value).length >= 80;
	}

	function normalizeConfig(raw) {
		var url = safeTrim(raw && raw.url);
		var anonKey = safeTrim(raw && (raw.anonKey || raw.key));
		if (!isValidUrl(url) || !isValidAnonKey(anonKey)) return null;
		return { url: url, anonKey: anonKey };
	}

	function readStoredConfig() {
		try {
			return normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
		} catch (_) {
			return null;
		}
	}

	function writeStoredConfig(config) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
			return true;
		} catch (_) {
			return false;
		}
	}

	function clearStoredConfig() {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch (_) {}
	}

	function readQueryConfig() {
		try {
			var params = new URLSearchParams(window.location.search || '');
			var url = safeTrim(params.get('sbUrl') || params.get('supabaseUrl'));
			var anonKey = safeTrim(params.get('sbKey') || params.get('supabaseKey') || params.get('supabaseAnonKey'));
			if (!url || !anonKey) return null;
			return normalizeConfig({ url: url, anonKey: anonKey });
		} catch (_) {
			return null;
		}
	}

	function stripQueryConfig() {
		try {
			var params = new URLSearchParams(window.location.search || '');
			var changed = false;
			['sbUrl', 'supabaseUrl', 'sbKey', 'supabaseKey', 'supabaseAnonKey'].forEach(function (key) {
				if (params.has(key)) {
					params.delete(key);
					changed = true;
				}
			});
			if (!changed || typeof history === 'undefined' || typeof history.replaceState !== 'function') return;
			var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + (window.location.hash || '');
			history.replaceState(null, '', next);
		} catch (_) {}
	}

	function applyConfig(config, nextSource) {
		SUPABASE_URL = config.url;
		SUPABASE_ANON_KEY = config.anonKey;
		source = nextSource;
		if (typeof window !== 'undefined') {
			window.SUPABASE_URL = SUPABASE_URL;
			window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
		}
	}

	allowOverride = isLocalRuntime();

	if (allowOverride) {
		var activeConfig = readQueryConfig();
		if (activeConfig) {
			writeStoredConfig(activeConfig);
			stripQueryConfig();
			applyConfig(activeConfig, 'query');
		} else {
			activeConfig = readStoredConfig();
			if (activeConfig) {
				applyConfig(activeConfig, 'localStorage');
			} else {
				applyConfig(DEFAULT_CONFIG, 'embedded');
			}
		}
	} else {
		applyConfig(DEFAULT_CONFIG, 'embedded');
	}

	if (typeof window !== 'undefined') {
		window.RSM_SUPABASE = {
			storageKey: STORAGE_KEY,
			getConfig: function () {
				return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, source: source, canManage: allowOverride };
			},
			saveConfig: function (nextConfig) {
				if (!allowOverride) throw new Error('Configurazione modificabile solo in locale.');
				var normalized = normalizeConfig(nextConfig);
				if (!normalized) throw new Error('Configurazione Supabase non valida.');
				writeStoredConfig(normalized);
				applyConfig(normalized, 'localStorage');
				return this.getConfig();
			},
			clearConfig: function () {
				if (!allowOverride) throw new Error('Configurazione modificabile solo in locale.');
				clearStoredConfig();
				applyConfig(DEFAULT_CONFIG, 'embedded');
				return this.getConfig();
			},
			usingCustomConfig: function () {
				return source !== 'embedded';
			},
			canManageConfig: function () {
				return allowOverride;
			},
			createClient: function () {
				if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
					throw new Error('SDK Supabase non caricato.');
				}
				return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
			}
		};
	}
})();
