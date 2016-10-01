//
//  ViewController.swift
//  PhotoCopy
//
//  Created by apple on 2016/09/30.
//  Copyright © 2016年 Kenta Motomura. All rights reserved.
//

import UIKit
import Photos

class ViewController: UIViewController {
	@IBOutlet weak var copyButton: UIButton!
	@IBOutlet weak var progressLabel: UILabel!
	@IBOutlet weak var deleteButton: UIButton!
	
	private let startText: String = "Copy to Photos"
	private let stopText: String = "Stop"
	private let albumName: String = "Photos"
	
	private var isCopying: Bool = false
	private var directory: String = ""
	private var assetCollectionPlaceholder: PHObjectPlaceholder!
	private var stopSignal: Bool = false

	override func viewDidLoad() {
		super.viewDidLoad()
		
		// Get the number of files
		directory = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)[0] as String
		let fileNames: Array<String> = getFiles()
		progressLabel.text = String(fileNames.count) + " files"
	}

	override func didReceiveMemoryWarning() {
		super.didReceiveMemoryWarning()
	}
	
	private func getFiles() -> Array<String> {
		let fileManager: FileManager = FileManager.default
		var fileNames: Array<String>
		do {
			try fileNames = fileManager.contentsOfDirectory(atPath: directory) as Array
		} catch {
			return []
		}
		return fileNames
	}
	
	private func getAlbum() -> PHAssetCollection? {
		let fetchOptions = PHFetchOptions()
		fetchOptions.predicate = NSPredicate(format: "title = %@", self.albumName)
		
		let collections: PHFetchResult = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: fetchOptions)
		if (collections.count > 0) {
			return collections.firstObject!
		}
		
		do {
			try PHPhotoLibrary.shared().performChangesAndWait({
				let createAlbumRequest: PHAssetCollectionChangeRequest = PHAssetCollectionChangeRequest.creationRequestForAssetCollection(withTitle: self.albumName)
				
				self.assetCollectionPlaceholder = createAlbumRequest.placeholderForCreatedAssetCollection
			})
			
		} catch {
			NSLog("Error: Cannot create album")
			return nil
		}
		
		let collectionFetchResult = PHAssetCollection.fetchAssetCollections(withLocalIdentifiers: [self.assetCollectionPlaceholder.localIdentifier], options: nil)
		return collectionFetchResult.firstObject
	}

	private func addAsset(names: Array<String>, index: Int, to album: PHAssetCollection) {
		if (stopSignal || index >= names.count) {
			stop()
			return
		}
		
		let fileName: String = names[index]
		let filePath: String = directory + "/" + fileName
		let fileUrl: NSURL = NSURL(string: filePath)!
		let suffix: String = fileUrl.pathExtension!.lowercased()
		
		DispatchQueue.main.async {
			self.progressLabel.text = String(index + 1) + " / " + String(names.count)
		}

		PHPhotoLibrary.shared().performChanges({
			var creationRequest: PHAssetChangeRequest!
			
			// Add asset
			if (suffix == "jpg" || suffix == "png") {
				creationRequest = PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: fileUrl as URL)!
			} else if (suffix == "mp4") {
				creationRequest = PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: fileUrl as URL)!
			} else {
				NSLog("Error: unknown extension: " + suffix)
				return
			}
			
			// Request editing the album.
			guard let assetRequest = PHAssetCollectionChangeRequest(for: album)
				else { return }
			
			// Get a placeholder for the new asset and add it to the album editing request.
			assetRequest.addAssets([creationRequest.placeholderForCreatedAsset!] as NSArray)
			
		}, completionHandler: { (success, error) -> Void in
			if (!success) {
				NSLog("Error: cannot save asset: \(error)")
			} else {
				self.addAsset(names: names, index: index + 1, to: album)
			}
		})
	}
	
	private func removeAllAssets(from album: PHAssetCollection) {
		// Get assets from the album
		let assets = PHAsset.fetchAssets(in: album, options: nil)
		
		do {
			// Remove assets from the album
			try PHPhotoLibrary.shared().performChangesAndWait({
				guard let assetRequest = PHAssetCollectionChangeRequest(for: album)
					else { return }
				
				assetRequest.removeAssets(assets)
			})
		} catch {
			NSLog("Error: cannot remove images")
			return
		}
	}
	
	private func stop() {
		DispatchQueue.main.async {
			self.copyButton.setTitle(self.startText, for: UIControlState.normal)
		}
		isCopying = false
	}

	@IBAction func touchCopyButton(_ sender: AnyObject) {
		if (!isCopying) {
			// Start copying
			
			// Reset
			stopSignal = false
			
			// Disable button
			copyButton.setTitle(stopText, for: UIControlState.normal)
			isCopying = true
			
			// Get file list
			let fileNames: Array<String> = getFiles()
			
			// Get album
			let album: PHAssetCollection? = getAlbum()
			
			// Start to add assets to album
			if (album != nil && fileNames.count > 0) {
				addAsset(names: fileNames, index: 0, to: album!)
			} else {
				// Stop
				stop()
			}
			
		} else {
			// Stop copying
			stopSignal = true
		}
	}
	
	@IBAction func touchDeleteButton(_ sender: AnyObject) {
		let album: PHAssetCollection? = getAlbum()
		
		if (album == nil) {
			return
		}
		
		removeAllAssets(from: album!)
	}
	
}
