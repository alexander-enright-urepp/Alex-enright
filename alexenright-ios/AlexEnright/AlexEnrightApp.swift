import SwiftUI
import OneSignalFramework
import UIKit

@main
struct AlexEnrightApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        // Initialize OneSignal with logging
        OneSignal.Debug.setLogLevel(.LL_VERBOSE)
        OneSignal.initialize("0a9c2637-a51d-4919-a76a-0660bb41b081", withLaunchOptions: nil)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Request notification permission
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            print("Notification permission granted: \(granted)")
            if let error = error {
                print("Permission error: \(error)")
            }
            
            if granted {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNS Device Token: \(token)")
        
        // This token should automatically be picked up by OneSignal
        // But let's make sure subscription is opted in
        OneSignal.User.pushSubscription.optIn()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            print("OneSignal Player ID: \(OneSignal.User.pushSubscription.id ?? "nil")")
            print("OneSignal Token: \(OneSignal.User.pushSubscription.token ?? "nil")")
            print("OneSignal Opted In: \(OneSignal.User.pushSubscription.optedIn)")
        }
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }
}
