import SwiftUI
import OneSignalFramework
import UIKit

@main
struct AlexEnrightApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    init() {
        // Initialize OneSignal (no verbose logging)
        OneSignal.initialize("0a9c2637-a51d-4919-a76a-0660bb41b081", withLaunchOptions: nil)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

class AppDelegate: NSObject, UIApplicationDelegate {
    private var hasRegistered = false
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // Only check once
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            if settings.authorizationStatus == .notDetermined {
                UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
                    if granted {
                        DispatchQueue.main.async {
                            application.registerForRemoteNotifications()
                        }
                    }
                }
            } else if settings.authorizationStatus == .authorized {
                DispatchQueue.main.async {
                    application.registerForRemoteNotifications()
                }
            }
        }
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        guard !hasRegistered else { return }  // Prevent duplicate logs
        hasRegistered = true
        
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNS Token: \(token.prefix(20))...")
        
        OneSignal.User.pushSubscription.optIn()
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Push registration failed: \(error.localizedDescription)")
    }
}
