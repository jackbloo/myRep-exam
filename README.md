<h1 align="center"> Geotagging Camera: a MyRepublic exam </h1> <br>
<p align="center">
    <img alt="phoneBook" title="GitPoint" src="https://w7.pngwing.com/pngs/849/583/png-transparent-gps-navigation-systems-garmin-ltd-glonass-wireless-handheld-devices-digital-camera-miscellaneous-angle-electronics-thumbnail.png" width="450">
</p>

<p align="center">
 Geotagging camera everywhere. Built with React native + typescript (android only).
</p>
<p>Template by 
  <a href="https://github.com/gitpoint">
    GitPoint
  </a>
</p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Flow](#flow)
- [Terms & Conditions](#terms-and-conditions)
- [Build Process](#build-process)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

**Introducing GeoCapture: Your Memories, Mapped**

In the vast tapestry of our lives, each moment is a unique thread, weaving together the story of our experiences. Imagine a camera that not only captures the visual essence of these moments but also preserves the geographical heartbeat of where they unfold. Welcome to GeoCapture, the revolutionary geotagging camera mobile application that transforms your photos into a rich tapestry of memories, seamlessly blending the art of photography with the precision of location technology.

With GeoCapture, every photo becomes more than just an image; it becomes a waypoint on your personal map of experiences. Our application goes beyond the ordinary, embedding GPS coordinates directly into the metadata of your photos, effortlessly cataloging the places where your memories come to life.

Key Features:

🌐 **Geotagging Magic**: Automatically capture the exact location where each photo is taken, giving your memories a sense of place.

🗺️ **Interactive Maps**: Explore your photo collection through interactive maps, allowing you to relive your experiences with a geographical context.

📍 **Location History**: Trace your journey over time by revisiting the locations where your photos were captured.

🌍 **Customizable Precision**: Tailor your geotagging preferences, from city-level precision to pinpointing exact coordinates, putting you in control.

🔒 **Privacy at Your Fingertips**: Safeguard your moments with privacy controls, determining who gets to see the geographical details of your memories.

GeoCapture is not just a camera app; it's a companion on your journey through time and space. Whether you're a travel enthusiast, a photography buff, or simply someone who cherishes every moment, GeoCapture adds a new dimension to the way you capture and reminisce about your life's adventures.

Download GeoCapture today and start mapping your memories—because every photo has a place, and every place has a story.

## Features

**Features of Geotagging Camera**:

Automatically embed GPS coordinates into the metadata of photos.
Option to toggle geotagging on/off for privacy.
Map Integration: View a map within the app displaying the location where each photo was taken.
Interactive map with pinch-to-zoom and pan features.

## Flow

1. User click the camera image
2. User take photo
3. The location will be there in the photo for watermark
4. The exif is added such as timestamp and location
5. The map will be rendered using the webview (please kindly read in the [terms and conditions](#terms-and-conditions))
6. App can detect fake gps and user will unable to use the features before turning off the fake gps

## Terms and Conditions

1. Map used is free, to use the google one need api key
2. For further development, barcode reader is available
3. Note that internet, media, storage, camera, location permission should all be granted
4. To check exifdata can go through this <a href="https://www.metadata2go.com/">website<a/> and upload the picture from this folder /storage/emulated/0/Download/example.jpg
5. Use x-plore on android to access the folder

## Build Process

- Clone or download the repo
- `npm install` to install dependencies
- `npm run android` to run the app in android
- `npm run build-android` to start building the app for android
- `npm run clean` to clean the android build
