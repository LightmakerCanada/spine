describe("Model.Relation", function(){
  var Album;
  var Photo;

  beforeEach(function(){
    Album = Spine.Model.setup("Album", ["name"]);
    Photo = Spine.Model.setup("Photo", ["name"]);
  });

  it("should honour hasMany associations", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create();

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all() ).toEqual([]);

    album.photos().create({name: "First Photo"});

    expect( Photo.first() ).toBeTruthy();
    expect( Photo.first().name ).toBe("First Photo");
    expect( Photo.first().album_id ).toBe(album.id);
  });

  it("should honour belongsTo associations", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    expect(Photo.attributes).toEqual(["name", "album_id"]);

    var album = Album.create({name: "First Album"});
    var photo = Photo.create({album: album});
    var photo2 = Photo.create({});
    console.log('1: ', photo);
    console.log('1: ', photo.album());
    console.log('2: ', photo2);
    console.log('2: ', photo2.album());
    expect( photo.album() ).toBeTruthy();
    expect( photo2.album() ).toBeFalsy();
    expect( photo.album().name ).toBe("First Album");
  });

  it("can count Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }],
      id: "1"
    });

    expect( album.photos().count ).toBeDefined()
    expect( album.photos().count() ).toEqual(2)
  });

  it("should associate an existing Singleton record", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      id: "1",
      name: "Beautiful album",
    });
    var photo = Photo.create({
      id: "2",
      name: "Beautiful photo"
    });

    album.photo(photo);

    expect( album.photo() ).toBeTruthy();
    expect( album.photo().album_id ).toBe("1");
    expect( album.photo().name ).toBe("Beautiful photo");
  });

  it("should create a new related Singleton record", function(){
    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photo: {
        name: "Beautiful photo"
      },
      id: "1"
    });

    expect( album.photo() ).toBeTruthy();
    expect( album.photo().album_id ).toBe("1");
    expect( album.photo().name ).toBe("Beautiful photo");
  });

  it("can create new parent and related Singleton record at once if UUIDs are enabled", function(){
    Album.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
    Photo.uuid = function(){ return '2d08ad90-9572-11e2-9c95-9b0af2c6635d' };

    Album.hasOne("photo", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album();
    album.load({
      name: "Beautiful album",
      photo: {
        name: "Beautiful photo"
      }
    });

    expect( album ).toBeTruthy();
    expect( album.id ).toEqual(Album.uuid());
    expect( album.photo() ).toBeTruthy();
    expect( album.photo().id ).toEqual(Photo.uuid());
    expect( album.photo().name ).toBe("Beautiful photo");

    delete Album.uuid
    delete Photo.uuid
  });

  it("should associate existing Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "3",
        name: "This record should be removed"
      }],
      id: "1"
    });

    expect( Photo.count() ).toBe(1);
    expect( album.photos().all().length ).toBe(1);
    expect( album.photos().first().id ).toBe("3");

    var photo1 = Photo.create({
      id: "1",
      name: "Beautiful photo 1"
    });
    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    album.photos([ photo1, photo2 ]);

    expect( Photo.count() ).toBe(2);
    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("should add unassociated records to an existing Collection", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      }],
      name: "Beautiful album",
      id: "1"
    });

    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(1);

    album.photos().add(photo2);

    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("should remove records from a Collection", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      }],
      name: "Beautiful album",
      id: "1"
    });

    var photo2 = Photo.create({
      id: "2",
      name: "Beautiful photo 2"
    });

    album.photos().add(photo2);

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().last().name ).toBe("Beautiful photo 2");

    album.photos().remove(photo2);

    expect( album.photos().all().length ).toBe(1);
    expect( album.photos().last().name ).toBe("Beautiful photo 1");
  });

  it("should create new related Collection records", function(){
    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = Album.create({
      name: "Beautiful album",
      photos: [{
        id: "1",
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }],
      id: "1"
    });

    expect( album.photos() ).toBeTruthy();
    expect( album.photos().all().length ).toBe(2);
    expect( album.photos().first().album_id ).toBe("1");
    expect( album.photos().last().album_id ).toBe("1");
    expect( album.photos().first().name ).toBe("Beautiful photo 1");
    expect( album.photos().last().name ).toBe("Beautiful photo 2");
  });

  it("can create new parent and related Collection records at once if UUIDs are enabled", function(){
    Album.uuid = function(){ return 'fc0942b0-956f-11e2-9c95-9b0af2c6635d' };
    Photo.uuid = function(){ return '2d08ad90-9572-11e2-9c95-9b0af2c6635d' };

    Album.hasMany("photos", Photo);
    Photo.belongsTo("album", Album);

    var album = new Album();
    album.load({
      name: "Beautiful album",
      photos: [{
        name: "Beautiful photo 1"
      },
      {
        id: "2",
        name: "Beautiful photo 2"
      }]
    });

    expect( album ).toBeTruthy();
    expect( album.id ).toEqual(Album.uuid());
    expect( album.photos().first() ).toBeTruthy();
    expect( album.photos().first().id ).toEqual(Photo.uuid());
    expect( album.photos().first().name ).toBe("Beautiful photo 1");

    delete Album.uuid
    delete Photo.uuid
  });

});
