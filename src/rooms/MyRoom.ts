import {Client, Room} from "colyseus";
import {MyRoomState} from "./schema/MyRoomState";
import {b2BodyType, b2CircleShape, b2PolygonShape, b2Shape, b2ShapeType, b2Vec2, b2World} from "@box2d/core";
import * as level from "./level.json";

export class MyRoom extends Room<MyRoomState> {

    public world: b2World = null;


    onCreate(options: any) {
        this.setState(new MyRoomState());

        const gravity: b2Vec2 = new b2Vec2(0, -10);
        this.world = b2World.Create(gravity);
        const box: b2PolygonShape = new b2PolygonShape();
        box.SetAsBox(1,1);
        level.map.forEach((v, i, a) => {
            this.world.CreateBody({
                type: b2BodyType.b2_staticBody,
                position: new b2Vec2(v.x, v.y)
            }).CreateFixture({shape: box});
        });


        // this.world.CreateBody({type: b2BodyType.b2_dynamicBody, position:new b2Vec2(10,20)}).CreateFixture({
        //     shape: new b2CircleShape(1),
        //     density: 1
        // });


        this.clock.setInterval(() => {
            console.log("OnStep!");
            // if (!this.world)
            //   return;
            this.world.Step(1 / 60, {velocityIterations: 10, positionIterations: 10});
            var pos = this.world.GetBodyList().GetPosition();
            console.log(pos);
        }, 100);

        console.log("Room created!");


        this.onMessage("type", (client, message) => {
            //
            // handle "type" message
            //
        });

    }

    onJoin(client: Client, options: any) {
        console.log(client.sessionId, "joined!");
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }

}
