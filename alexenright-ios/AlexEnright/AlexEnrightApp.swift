import SwiftUI
import OneSignalFramework

@main
struct AlexEnrightApp: App {
    init() {
        OneSignal.initialize("0a9c2637-a51d-4919-a76a-0660bb41b081", withLaunchOptions: nil)
        
        // Request permission with delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            OneSignal.Notifications.requestPermission { accepted in
                print("Permission: \(accepted)")
            }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
