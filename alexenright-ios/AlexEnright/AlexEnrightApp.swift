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
                
                // Explicitly opt in to push notifications
                if accepted {
                    OneSignal.User.pushSubscription.optIn()
                    print("Opted in to push")
                }
                
                // Log OneSignal ID for debugging
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    let id = OneSignal.User.pushSubscription.id
                    print("OneSignal Player ID: \(id ?? "nil")")
                    print("OneSignal Token: \(OneSignal.User.pushSubscription.token ?? "nil")")
                    print("Opted In: \(OneSignal.User.pushSubscription.optedIn)")
                }
            }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
