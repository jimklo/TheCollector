// Must be a list of SIGN ONLY keys
var whitelist = [
    {
        'owner': 'jim.klo+test@learningregistry.org',
        'public_key': 
            '-----BEGIN PGP PUBLIC KEY BLOCK-----\n' +
            'Version: GnuPG/MacGPG2 v2.0.19 (Darwin)\n' +
            'Comment: GPGTools - http://gpgtools.org\n' +
            '\n' +
            'mQENBE/hNj8BCADMa9VHHAXHuERFownr8SJxt2t7jZTqblWn1C9V4rmReX15QhZG\n' +
            'ChoF71WOvLdf35+vT0ohfgWbyQEA7yznzhYqkqtZpqIVEgB5LpMnTRy/buQzTYTL\n' +
            'JN7+1UnJ2lPKg6CyuqIVRxkQc7baArPPjuYnjE18PGrDq28ermayaqxJOKfUlTLi\n' +
            'IUxi0R2m/7wkUcrE3W72TyeLvQ1icqkS5MlH17aRTeWQPCeHJnAunzamOmIhO0ko\n' +
            'YanRf1tg2xvhEUeVMyGPmZAaJ3ic9I77c1DIk5kwCIMHiCxtwnKwiHjco0KZUsq2\n' +
            'fD6lL1GqFFHxSIAnWE0YgMpd/GS5huqqoP9JABEBAAG0PkxlYXJuaW5nIFJlZ2lz\n' +
            'dHJ5IFRlc3QgS2V5IDxqaW0ua2xvK3Rlc3RAbGVhcm5pbmdyZWdpc3RyeS5vcmc+\n' +
            'iQE+BBMBAgAoBQJP4TY/AhsvBQkHhh+ABgsJCAcDAgYVCAIJCgsEFgIDAQIeAQIX\n' +
            'gAAKCRAUlSLjcnSQZvvnCACHIikS4Ur7XlfTJQQ72XEX0yo698x1P2Qz8za+BUxh\n' +
            'aOvq8BimNsk0jo52DSrj6fIuyrZwRZyUD3G7e0mOFm6cT4kJJuCsk7Yt4oZzLRH/\n' +
            'VN7hxmFxo5OS3aZu4wvG8asY8qUYjS1FCStissrq4JzwoUtIkjxi6GZg2cNvKC2u\n' +
            'O9xMC1wfF3Mzbm6jKuQ7dpjxp7I6cFqGyvecxzVbUTqATdiHuiiHbkkZ0Ag4Inq+\n' +
            'kZBV39eD0uqnInoRQ7ECY2ixn4U5ZCkx/4RhqJ9Eoi44dM+OPM/dD+d0x7yqfn6s\n' +
            'f5cV/Flc3NQaWBgexEZeVZUE5KOOerQV7EI/7DdTOOcB\n' +
            '=xJKb\n' +
            '-----END PGP PUBLIC KEY BLOCK-----\n'
    }
];


function joinKeys(keymap) {
    var keylist = "";
    for (var key in keymap) {
        keylist += keymap[key];
    }
    return keylist;
}

exports.armoredPublicKeys = whitelist;
