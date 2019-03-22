import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { RootObject } from './interfaces/spotify-get-users-currently-playing-track'
import { PlayingTrack } from './types/playing-track';

admin.initializeApp();
const REGION = 'asia-northeast1';

const SpotifyWebApi = require('spotify-web-api-node')
const spotifyCredentials = functions.config().spotify.credentials;
// console.info(spotifyCredentials)
const spotifyApi = new SpotifyWebApi({
    clientId: spotifyCredentials.client_id,
    clientSecret: spotifyCredentials.client_secret,
    redirectUri: spotifyCredentials.redirect_uri
})
spotifyApi.setAccessToken(spotifyCredentials.initial_access_token)
spotifyApi.setRefreshToken(spotifyCredentials.initial_refresh_token)

export const nowPlaying = functions.region(REGION).https.onRequest(async (_request, response) => {
    console.info(`start`)
    const db = admin.firestore()

    const RefreshAccessToken = async function () {
        console.info(`refresh accessToken`)
        const refreshAccessTokenResponse = await spotifyApi.refreshAccessToken()
        // console.info(refreshAccessTokenResponse.body);
        const newAccessToken = refreshAccessTokenResponse.body['access_token']
        spotifyApi.setAccessToken(newAccessToken);

        // console.info(`write accessToken: ${newAccessToken}`)
        await db.collection('spotify').doc('config').set({ 'access_token': newAccessToken })
    }

    try {
        console.info(`get accessToken`)
        const accessToken = await db.collection('spotify').doc('config').get().then(doc => doc.get('access_token'))
        spotifyApi.setAccessToken(accessToken)
        // console.info(`set accessToken: ${accessToken}`)

        console.info(`get MyCurrentPlayingTrack`)
        const myCurrentPlayingTrackResponse = await spotifyApi.getMyCurrentPlayingTrack();
        if (myCurrentPlayingTrackResponse.statusCode !== 200) {
            if (myCurrentPlayingTrackResponse.statusCode === 204) {
                console.info(`No Content`)
            } else {
                console.error(myCurrentPlayingTrackResponse)
            }

            await RefreshAccessToken();

            return response.status(myCurrentPlayingTrackResponse.statusCode).send(JSON.stringify(myCurrentPlayingTrackResponse))
        }

        const root: RootObject = myCurrentPlayingTrackResponse.body;
        const playingTrack: PlayingTrack = {
            item_name:    root.item.name,
            item_uri:     root.item.uri,
            artist_names: root.item.artists.map(artist => artist.name),
            artist_uris:  root.item.artists.map(artist => artist.uri),
            timestamp:    root.timestamp
        }
        console.info(playingTrack)
        console.info(`add PlayingTrack`)
        const playingTracks = db.collection('spotify').doc('playing_tracks')

        console.info(`add PlayingTrack history`)
        await playingTracks.collection('history').doc(playingTrack.timestamp.toString()).set(playingTrack)
        console.info(`add PlayingTrack latest`)
        await playingTracks.set({latest: playingTrack})

        await RefreshAccessToken();

        return response.status(200).send(JSON.stringify(playingTrack))
    } catch (error) {
        console.error(error)       

        await RefreshAccessToken();

        return response.status(400).send(`error`)
    }
});