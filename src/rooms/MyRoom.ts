import {Client, Room} from "colyseus";
import {MyRoomState} from "./schema/MyRoomState";
import {b2BodyType, b2CircleShape, b2Vec2, b2World} from "@box2d/core";

export class MyRoom extends Room<MyRoomState> {

    public world: b2World = null;


    onCreate(options: any) {
        this.setState(new MyRoomState());

        const gravity: b2Vec2 = new b2Vec2(0, -10);
        this.world = b2World.Create(gravity);
        this.world.CreateBody({type:b2BodyType.b2_dynamicBody}).CreateFixture({shape: new b2CircleShape(1), density:1});


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
