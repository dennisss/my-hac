//
//  MyHacBackend.m
//  My HAC
//
//  Created by Dennis on 1/26/13.
//
//

#import "MyHacBackend.h"
#import <Cordova/CDV.h>
#import <CoreLocation/CoreLocation.h>

@implementation hClass

@synthesize Name, SectionID, Average;

@end

@implementation MyHacBackend

static MyHacBackend *instance;

//static dispatch_block_t expirationHandler;
//static dispatch_block_t script;
//static UIBackgroundTaskIdentifier bgTask;

+ (MyHacBackend*) instance { return instance;};
//+ (dispatch_block_t) script;
//+ (UIBackgroundTaskIdentifier) bgTask;
//+ (void) setBgTask:(UIBackgroundTaskIdentifier)identifier;


- (void) initial:(CDVInvokedUrlCommand *)command
{
    NSLog(@"INITIALIZED");
    [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 0];
    
    script = nil;
    instance = self;
}

/* gradeUpdater(checkInterval) */
- (void) gradeUpdater:(CDVInvokedUrlCommand *)command
{
    
    
    
}

/* addSubject(sectionId, name) */
- (void) addSubject:(CDVInvokedUrlCommand*)command
{

    NSString* sid = [command.arguments objectAtIndex:0];
    //stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]] FIXED IN JAVASCRIPT
    NSString* session = [command.arguments objectAtIndex:1];
    NSString* name = [command.arguments objectAtIndex:2];// copy];
    NSLog(sid);
    
    hClass* h = [hClass alloc];
    h.Name = name;
    h.SectionID = sid;
    h.CourseSession = session;
    h.Average = NAN;
    
    [Classes addObject: h];

    //[ClassNames setObject:name forKey:sid];
    
    
}


/* setup(baseUrl, run, intNotifInterval) */
- (void) setup:(CDVInvokedUrlCommand *)command
{
    if(script != nil){
        @try {
            /* Cleanup old setup */
            //[Classes release];
            //[BaseAddress release];
            //[Run release];
        }
        @catch (NSException *e) {
            NSLog("Exception %@", e);
        }
    }
    else{
        /* LoggedIn status will be preserved unless first setup */
        LoggedIn = FALSE;
    }
    
    Classes = [[NSMutableArray alloc] init];
    
    //ClassNames = [[NSMutableDictionary alloc] init];
    //Data = [[NSMutableDictionary alloc] init];
    CurrentSubject = 0;
    
    BaseAddress = [[command.arguments objectAtIndex:0] copy];
    Run = [[command.arguments objectAtIndex:1] copy];
    
    NotifInterval = [[command.arguments objectAtIndex:2] integerValue] * 60;
    
    if(NotifInterval < 300 || NotifInterval > 1800){
        NSLog(@"Time overridden to 10 minutes");
        NotifInterval = 600;
    }
    //NotifInterval = 30;
    
///////////////////////NotifInterval = 20;
    
    NSLog(@"Set Interval: %d", NotifInterval);
    
    if(script != nil){//bgTask != nil || expirationHandler != nil){
        return;
    }
    
    //BOOL result = [[UIApplication sharedApplication] setKeepAliveTimeout:notifInterval handler:
    
    bgTask = UIBackgroundTaskInvalid;
    
    
    expirationHandler = ^{
        UIApplication* app = [UIApplication sharedApplication];
        [app endBackgroundTask:[MyHacBackend instance]->bgTask];
        [MyHacBackend instance]->bgTask = UIBackgroundTaskInvalid;
        [[MyHacBackend instance]->locationManager startUpdatingLocation];
    };
    
    
    
    locationManager = [[CLLocationManager alloc] init];
    locationManager.delegate = self;
    [locationManager startUpdatingLocation];
    
    script = ^{
        while (true) {
            if(LoggedIn)
            {
                @try{
                
                
                int i;
                
                NSLog(@"--------");
                
                NSTimeInterval tLeft = 10 * 1000;
                NSDate* start = [NSDate date];
            
                int count = [Classes count];
                for(i = CurrentSubject + 1; TRUE; i++){
                    
                    if(i >= count){
                        i = 0;
                    }
                
                    hClass* obj = [Classes objectAtIndex:i];
                    
                    NSString *url = [NSString stringWithFormat:@"%@Student/ClassworkAverages.aspx?course_session=%@&rc_run=%@&section_key=%@", BaseAddress, obj.CourseSession, Run, obj.SectionID];
             
//NSLog(url);
                    NSString *str = [self stringWithUrl: [NSURL URLWithString: url]];
                    if (str == NULL) {
                        break;
                    }
                    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"MP:.*<td>([0-9|\.]*)%</td>" options:0 error:NULL];

                    
                    //Will fail here if no network
                    NSTextCheckingResult *match = [regex firstMatchInString:str options:0 range:NSMakeRange(0, [str length])];
             
             
                    //[match rangeAtIndex:1] //gives the range of the group in parentheses
                    NSString *a = [[str substringWithRange:[match rangeAtIndex:1]] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
             
                    
                    if(![a isEqualToString:@""]) //<!-------Check this line
                    {
                        double average = [a doubleValue];
                        NSLog(@"%f", average);

                        if(!isnan(obj.Average))
                        {
                            if(obj.Average != average){
//                                NSLog(@"Dif: %f", average - obj.Average);
                                UILocalNotification *localNotif = [[UILocalNotification alloc] init];
                                
                                if (localNotif) {
             
                                    localNotif.alertBody = [NSString stringWithFormat:@"New grades in %@", obj.Name];
                                    localNotif.alertAction = @"View Grades";
                                    localNotif.soundName = @"alarmsound.caf";
                                    
                                    NSDictionary *userDict = [NSDictionary dictionaryWithObject:obj.SectionID forKey:@"sid"];
                                    localNotif.userInfo = userDict;

                                    localNotif.applicationIconBadgeNumber = [[UIApplication sharedApplication]applicationIconBadgeNumber] + 1;
                                    [[UIApplication sharedApplication] presentLocalNotificationNow:localNotif];
                                    [localNotif release];
                                }
                            }
             
                        }

                        obj.Average = average;
                        [Classes replaceObjectAtIndex:i withObject:obj];
                        //[Classes setObject:obj atIndexedSubscript:i];
                        
                    }
                    else{
                        
                        /*
                         
                         Notification: "HAC Session Timed out: Please log in again."
                         */
                        UILocalNotification *localNotif = [[UILocalNotification alloc] init];
                        
                        if (localNotif) {
                            
                            localNotif.alertBody = @"Notifications timed out because of a bad internet connection. Please relogin.";
                            localNotif.alertAction = @"Log in";
                            localNotif.soundName = @"alarmsound.caf";
                            
                            NSDictionary *userDict = [NSDictionary dictionaryWithObject:@"" forKey:@"fail"];
                            localNotif.userInfo = userDict;
                            
                            localNotif.applicationIconBadgeNumber = [[UIApplication sharedApplication]applicationIconBadgeNumber] + 1;
                            [[UIApplication sharedApplication] presentLocalNotificationNow:localNotif];
                            [localNotif release];
                        }
                        
                        
                        NSLog(@"ERROR %x", i);
                        return;
                    }
                    
                    NSTimeInterval delta = [start timeIntervalSinceNow];
                    tLeft += delta;
                    start = [NSDate date];
                    
//                    NSLog(@"%f", tLeft);
                    if (tLeft < (5.1 * 1000) || i == CurrentSubject) {
                        CurrentSubject = i;
                        break;
                    }
             
                }
                    
                }
                @catch (NSException *e) {}

            }
//            NSLog(@"Pausing for %d", NotifInterval);
//            NSLog(@"backgroundTimeRemaining: %.0f", [[UIApplication sharedApplication] backgroundTimeRemaining]);
            [NSThread sleepForTimeInterval:NotifInterval];
        }
    };
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), script);
    
}

- (void)locationManager:(CLLocationManager *)manager
    didUpdateToLocation:(CLLocation *)newLocation
           fromLocation:(CLLocation *)oldLocation
{
    //NSLog(@"Got location: %.0f", [[UIApplication sharedApplication] backgroundTimeRemaining]);
    if([MyHacBackend instance]->bgTask != UIBackgroundTaskInvalid)
        return;
    
    [[MyHacBackend instance]->locationManager stopUpdatingLocation];
    UIApplication* app = [UIApplication sharedApplication];
    
    [MyHacBackend instance]->bgTask = [app beginBackgroundTaskWithExpirationHandler:[MyHacBackend instance]->expirationHandler];
    
}


- (void)locationManager:(CLLocationManager *)manager
     didUpdateLocations:(NSArray *)locations
{
    //NSLog(@"Got location: %.0f", [[UIApplication sharedApplication] backgroundTimeRemaining]);
    if([MyHacBackend instance]->bgTask != UIBackgroundTaskInvalid)
        return;
    
    [[MyHacBackend instance]->locationManager stopUpdatingLocation];
    UIApplication* app = [UIApplication sharedApplication];
    
    [MyHacBackend instance]->bgTask = [app beginBackgroundTaskWithExpirationHandler:[MyHacBackend instance]->expirationHandler];
    
}

- (void) startNotif:(CDVInvokedUrlCommand*)command
{
    LoggedIn = TRUE;
}

- (void) stopNotif:(CDVInvokedUrlCommand *)command
{
    LoggedIn = FALSE;
    [Classes dealloc];
    [BaseAddress dealloc];
    [Run dealloc];
}

- (void) clearCookies:(CDVInvokedUrlCommand*)command
{
    NSHTTPCookie *cookie;
    NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (cookie in [storage cookies]) {
        [storage deleteCookie:cookie];
    }
    [[NSUserDefaults standardUserDefaults] synchronize];
}


- (void)didReceiveLocalNotification:(NSNotification *)notification
{
    if([notification.name isEqualToString:CDVLocalNotification])
    {
        
        //FIX THIS COUNTER
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 0];
        [notification.userInfo valueForKeyIsNull:@""];
        
        [[UIApplication sharedApplication] cancelLocalNotification:notification];
        //[[UIApplication sharedApplication] cancelAllLocalNotifications];
        [self writeJavascript:[NSString stringWithFormat:@"window.location = '#grades|%@';", [notification.userInfo objectForKey:@"sid"]]];
    }
}


- (NSString *)stringWithUrl:(NSURL *)url
{
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:url
                                                cachePolicy:NSURLRequestReloadIgnoringCacheData
                                            timeoutInterval:5];
    // Fetch the JSON response
    NSData *urlData;
    NSURLResponse *response;
    NSError *error;
    
    // Make synchronous request
    urlData = [NSURLConnection sendSynchronousRequest:urlRequest
                                    returningResponse:&response
                                                error:&error];
    
    if(response == NULL)
        return NULL;
    
    // Construct a String around the Data from the response
    return [[NSString alloc] initWithData:urlData encoding:NSUTF8StringEncoding];
}


@end