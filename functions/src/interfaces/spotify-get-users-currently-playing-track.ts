export interface ExternalUrls {
    spotify: string;
}

export interface Context {
    external_urls: ExternalUrls;
    href: string;
    type: string;
    uri: string;
}

export interface Artist {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface Image {
    height: number;
    url: string;
    width: number;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: Image[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface ExternalIds {
    isrc: string;
}

export interface LinkedFrom {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    type: string;
    uri: string;
}

export interface Item {
    album: Album;
    artists: Artist[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    is_playable: boolean;
    linked_from: LinkedFrom;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
}

export interface Disallows {
    resuming: boolean;
    seeking: boolean;
    skipping_prev: boolean;
    toggling_repeat_track: boolean;
    toggling_shuffle: boolean;
}

export interface Actions {
    disallows: Disallows;
}

export interface RootObject {
    timestamp: number;
    context: Context;
    progress_ms: number;
    item: Item;
    currently_playing_type: string;
    actions: Actions;
    is_playing: boolean;
}