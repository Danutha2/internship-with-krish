export class EventDTO{
    name:string
    date:Date
    category:EventCategory
}

export enum EventCategory {
    FESTIVAL = 'FESTIVAL',          // e.g., music festivals, beach festivals
    SPORT = 'SPORT',                // e.g., marathons, surfing competitions
    CULTURAL = 'CULTURAL',          // e.g., cultural exhibitions, local traditions
    FOOD = 'FOOD',                  // e.g., food fairs, culinary events
    CONCERT = 'CONCERT',            // music or performance events
    TOURISTIC = 'TOURISTIC'         // guided tours, sightseeing events
}
