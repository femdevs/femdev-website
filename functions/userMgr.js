class UserPermissions {
    static permissions = {
        global: { // 0:x:x
            data: { // 0:0:x
                read: new PermissionSet("Global::Data.Read", 0, 0, 0),
                write: new PermissionSet("Global::Data.Write", 1, 0, 0),
                create: new PermissionSet("Global::Data.Create", 2, 0, 0),
                delete: new PermissionSet("Global::Data.Delete", 3, 0, 0)
            },
            token: { // 0:1:x
                read: new PermissionSet("Global::Token.Read", 0, 0, 1),
                readAll: new PermissionSet("Global::Token.ReadAll", 1, 0, 1),
                write: new PermissionSet("Global::Token.Write", 2, 0, 1),
                create: new PermissionSet("Global::Token.Create", 3, 0, 1),
                delete: new PermissionSet("Global::Token.Delete", 4, 0, 1)
            },
            user: { // 0:2:x
                read: new PermissionSet("Global::User.Read", 0, 0, 2),
                readAll: new PermissionSet("Global::User.ReadAll", 1, 0, 2),
                write: new PermissionSet("Global::User.Write", 2, 0, 2),
                create: new PermissionSet("Global::User.Create", 3, 0, 2),
                delete: new PermissionSet("Global::User.Delete", 4, 0, 2)
            },
            role: { // 0:3:x
                developer: new PermissionSet("Global::Role.Developer", 0, 0, 3),
                administrator: new PermissionSet("Global::Role.Administrator", 1, 0, 3),
                owner: new PermissionSet("Global::Role.Owner", 2, 0, 3)
            }
        },
        cryptography: { // 1:x
            encrypt: new PermissionSet("Cryptography::Encrypt", 0, 1),
            decrypt: new PermissionSet("Cryptography::Decrypt", 1, 1)
        },
        dictionary: { // 2:x
            definition: new PermissionSet("Dictionary::Definition", 0, 2),
            synonym: new PermissionSet("Dictionary::Synonym", 1, 2),
            antonym: new PermissionSet("Dictionary::Antonym", 2, 2)
        },
        facts: { // 3:x
            chuckNorris: new PermissionSet("Facts::ChuckNorris", 0, 3),
            cat: new PermissionSet("Facts::Cat", 1, 3),
            dog: new PermissionSet("Facts::Dog", 2, 3),
        },
        location: { // 4:x
            coord: new PermissionSet("Location::Coord", 0, 4),
            pluscode: new PermissionSet("Location::Pluscode", 1, 4),
            address: new PermissionSet("Location::Address", 2, 4)
        },
        phone: { // 5:x
            lookup: new PermissionSet("Phone::Lookup", 0, 5),
            validate: new PermissionSet("Phone::Validate", 1, 5)
        },
        quote: { // 6:x
            kanye: new PermissionSet("Quote::Kanye", 0, 6),
            ronSwanson: new PermissionSet("Quote::RonSwanson", 1, 6),
            random: new PermissionSet("Quote::Random", 2, 6)
        },
        weather: { // 7:x
            current: new PermissionSet("Weather::Current", 0, 7),
        },
        minecraft: { // 8:x:x
            hive: { // 8:0:x
                player: new PermissionSet("Minecraft::Hive.Player", 0, 8, 0),
                map: new PermissionSet("Minecraft::Hive.Map", 1, 8, 0),
            }
        },
    }
    static PBD = new Map()
        .set("0:0:0", "Global::Data.Read")
        .set("0:0:1", "Global::Data.Write")
        .set("0:0:2", "Global::Data.Create")
        .set("0:0:3", "Global::Data.Delete")
        .set("0:1:0", "Global::Token.Read")
        .set("0:1:1", "Global::Token.ReadAll")
        .set("0:1:2", "Global::Token.Write")
        .set("0:1:3", "Global::Token.Create")
        .set("0:1:4", "Global::Token.Delete")
        .set("0:2:0", "Global::User.Read")
        .set("0:2:1", "Global::User.ReadAll")
        .set("0:2:2", "Global::User.Write")
        .set("0:2:3", "Global::User.Create")
        .set("0:2:4", "Global::User.Delete")
        .set("0:3:0", "Global::Role.Developer")
        .set("0:3:1", "Global::Role.Administrator")
        .set("0:3:2", "Global::Role.Owner")
        .set("1:0", "Cryptography::Encrypt")
        .set("1:1", "Cryptography::Decrypt")
        .set("2:0", "Dictionary::Definition")
        .set("2:1", "Dictionary::Synonym")
        .set("2:2", "Dictionary::Antonym")
        .set("3:0", "Facts::ChuckNorris")
        .set("3:1", "Facts::Cat")
        .set("3:2", "Facts::Dog")
        .set("4:0", "Location::Coord")
        .set("4:1", "Location::Pluscode")
        .set("4:2", "Location::Address")
        .set("5:0", "Phone::Lookup")
        .set("5:1", "Phone::Validate")
        .set("6:0", "Quote::Kanye")
        .set("6:1", "Quote::RonSwanson")
        .set("6:2", "Quote::Random")
        .set("7:0", "Weather::Current")
        .set("8:0:0", "Minecraft::Hive.Player")
        .set("8:0:1", "Minecraft::Hive.Map")
}

class PermissionSet {
    constructor(key, bit, ...parentBits) {
        this.permKey = key;
        this.bit = bit;
        this.parentBits = parentBits;
        this.bitStr = Array.from(this.parentBits).concat([this.bit]).join(':');
    }
}

class UserPermissionSet {
    /** @param {PermissionSet} basePermission */
    constructor(basePermission) {
        const base = basePermission;
        this.permKey = base.permKey;
        this.bit = base.bit;
        this.permBitStr = base.bitStr;
        this.enabled = false;
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    toggle() {
        this.enabled = !this.enabled;
    }
    isEnabled() {
        return this.enabled;
    }
}

class User {
    constructor() {
        /** @type {Map<string, UserPermissionSet>} */ this.perms = new Map()
        Object.values(UserPermissions.permissions)
            .forEach(v => Object.values(v)
                .forEach(x => (x instanceof PermissionSet)
                    ? this.perms.set(x.permKey, new UserPermissionSet(x))
                    : Object.values(x).forEach(y => this.perms.set(y.permKey, new UserPermissionSet(y)))
                )
            );
    }
    /** @param {string} perm */
    givePermission = (perm) => this.perms.get(perm).enable();
    /** @param {string} perm */
    removePermission = (perm) => this.perms.get(perm).disable();
    /** @param {string} perm */
    togglePermission = (perm) => this.perms.get(perm).toggle();
    /** @param {string} perm @param {boolean} allowMgr */
    hasPermission = (perm, allowMgr=true) => [perm].concat((allowMgr) ? ['Owner', 'Administrator', 'Developer'].map(v => `Global::Role.${v}`) : []).some(v => this.perms.get(v).isEnabled())
    getActivePerms = () => Array.from(this.perms.values()).filter(v => v.isEnabled())
    getFullPermissionString = () => this.getActivePerms().map(v => v.permKey).join(',');
    getFullPermissionBitString = () => this.getActivePerms().map(v => v.permBitStr).join(',');
    static fromFullPermissionString(permStr) {
        const user = new User();
        permStr.split(',').forEach(v => user.givePermission(v));
        return user;
    }
    static fromFullPermissionBitString(permStr) {
        const user = new User();
        permStr.split(',').forEach(v => user.givePermission(UserPermissions.PBD.get(v)));
        return user;
    }
}

module.exports = User;